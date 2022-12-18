import { initializeApp } from 'firebase/app'
import { getAnalytics, logEvent as firebaseLogEvent } from 'firebase/analytics'
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  updateProfile,
} from 'firebase/auth'
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp,
  getCount,
} from 'firebase/firestore/lite'
import { firebaseConfig } from '@env'

/** @typedef {import('firebase/auth').User} User */
/** @typedef {import('firebase/firestore/lite').DocumentData} DocumentData */
/**
 *  @template {DocumentData} T
 *  @typedef {import('firebase/firestore/lite').DocumentSnapshot} DocumentSnapshot
 */

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

export const logEvent = firebaseLogEvent.bind(null, getAnalytics(app))

const replaysRef = collection(db, 'replays')
const entriesRef = collection(db, 'entries')

/**
 * @param {DocumentSnapshot<DocumentData>} docSnap
 * @return {EntryData | null}
 */
function toEntryData(docSnap) {
  const docData = docSnap.data()
  if (docData) {
    return {
      id: docSnap.id,
      uid: docData.uid,
      name: docData.name,
      replayId: docData.replayId,
      score: docData.score,
      type: docData.type,
      registeredAt: docData?.registeredAt.toDate(),
    }
  }
  return null
}

/**
 * @param {DocumentSnapshot<DocumentData>} docSnap
 * @return {ReplayData | null}
 */
function toReplayData(docSnap) {
  const docData = docSnap.data()
  if (docData) {
    return {
      id: docSnap.id,
      uid: docData.uid,
      score: docData.score,
      type: docData.type,
      log: docData.log,
    }
  }
  return null
}

/** @type {Promise<User>} */
const mePromise = new Promise((resolve) => {
  onAuthStateChanged(auth, (user) => {
    if (user) resolve(user)
    else signInAnonymously(auth)
  })
})

function fetchMe() {
  return mePromise
}

export function getMe() {
  return auth.currentUser
}

/**
 * @param {string} id
 */
export async function fetchReplayData(id) {
  const docSnap = await getDoc(doc(replaysRef, id))
  return toReplayData(docSnap)
}

/**
 * @param {string} uid
 */
export async function fetchEntry(uid) {
  const querySnap = await getDocs(
    query(
      entriesRef,
      where('type', '==', 'scoretrial'),
      where('uid', '==', uid),
      orderBy('score', 'desc'),
      orderBy('registeredAt', 'desc'),
      limit(1)
    )
  )
  const docSnap = querySnap.docs.at(0)
  return docSnap ? toEntryData(docSnap) : null
}

/** @type {EntryData | null} */
let meEntry = null
/** @type {Promise<EntryData | null> | null} */
let meEntryPromise = null

function fetchMeEntry() {
  if (!meEntryPromise) {
    meEntryPromise = fetchMe().then(async (user) => {
      meEntry = await fetchEntry(user.uid)
      return meEntry
    })
  }
  return meEntryPromise
}

export function getMeEntry() {
  fetchMeEntry()
  return meEntry
}

/** @type {number | null} */
let meRank = null
/** @type {Promise<number | null> | null} */
let meRankPromise = null

function fetchMeRank() {
  if (!meRankPromise) {
    meRankPromise = fetchMeEntry().then(async (entry) => {
      if (entry) {
        const querySnap = await getCount(
          query(
            entriesRef,
            where('type', '==', 'scoretrial'),
            where('score', '>', entry.score)
          )
        )
        meRank = querySnap.data().count + 1
        return meRank
      }
      return null
    })
  }
  return meRankPromise
}

export function getMeRank() {
  fetchMeRank()
  return meRank
}

/** @type {EntryData[] | null} */
let topEntries = null
/** @type {Promise<EntryData[]> | null} */
let topEntriesPromise = null

function fetchTopEntries() {
  if (!topEntriesPromise) {
    topEntriesPromise = getDocs(
      query(
        entriesRef,
        where('type', '==', 'scoretrial'),
        orderBy('score', 'desc'),
        orderBy('registeredAt', 'desc'),
        limit(100)
      )
    ).then((querySnap) => {
      topEntries = querySnap.docs.map(toEntryData).flatMap((e) => e ?? [])
      return topEntries
    })
  }
  return topEntriesPromise
}

export function getTopEntries() {
  fetchTopEntries()
  return topEntries
}

/** @type {ReplayData[] | null} */
let meReplays = null
/** @type {Promise<ReplayData[]> | null} */
let meReplaysPromise = null

function fetchMeReplays() {
  if (!meReplaysPromise) {
    meReplaysPromise = fetchMe().then(async (user) => {
      const querySnap = await getDocs(
        query(
          replaysRef,
          where('type', '==', 'scoretrial'),
          where('uid', '==', user.uid),
          orderBy('score', 'desc'),
          orderBy('registeredAt', 'desc'),
          limit(9)
        )
      )
      meReplays = querySnap.docs.map(toReplayData).flatMap((e) => e ?? [])
      return meReplays
    })
  }
  return meReplaysPromise
}

export function getMeReplays() {
  fetchMeReplays()
  return meReplays
}

/**
 * @param {string} name
 */
export async function updateMeName(name) {
  await Promise.all([
    fetchMe().then((user) => {
      return updateProfile(user, { displayName: name })
    }),

    fetchMeEntry().then((entry) => {
      if (entry) {
        return updateDoc(doc(entriesRef, entry.id), { name })
      }
    }),
  ])

  topEntriesPromise = null
}

/**
 * @param {number} score
 * @param {string} log
 */
export async function updateEntry(score, log) {
  const user = await fetchMe()
  const replayDocRef = await addDoc(replaysRef, {
    registeredAt: serverTimestamp(),
    score,
    log,
    type: 'scoretrial',
    uid: user.uid,
  })
  const entry = await fetchMeEntry()

  if (!entry) {
    await fetchMe().then(async (user) => {
      return addDoc(entriesRef, {
        uid: user.uid,
        name: user.displayName || '',
        replayId: replayDocRef.id,
        score,
        type: 'scoretrial',
        registeredAt: serverTimestamp(),
      })
    })
  } else if (entry.score < score) {
    await updateDoc(doc(entriesRef, entry.id), {
      registeredAt: serverTimestamp(),
      replayId: replayDocRef.id,
      score,
    })
  }

  meEntryPromise = null
  meRankPromise = null
  meReplaysPromise = null
  topEntriesPromise = null

  return replayDocRef.id
}
