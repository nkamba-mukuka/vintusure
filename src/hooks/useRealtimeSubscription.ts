'use client';

import { useEffect, useState } from 'react';
import {
    collection,
    query,
    onSnapshot,
    QueryConstraint,
    DocumentData,
    Query,
    doc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

// Base type for documents with ID
type WithId = { id: string };

// Generic type for the data structure that ensures T includes an id field
type CollectionData<T extends WithId> = {
    [key: string]: T;
};

export function useRealtimeCollection<T extends DocumentData & WithId>(
    collectionName: string,
    constraints: QueryConstraint[] = [],
    enabled: boolean = true
) {
    const [data, setData] = useState<CollectionData<T>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!enabled) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const q = query(collection(db, collectionName), ...constraints);

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const newData: CollectionData<T> = {};
                snapshot.forEach((doc) => {
                    newData[doc.id] = {
                        ...doc.data(),
                        id: doc.id,
                    } as T;
                });
                setData(newData);
                setLoading(false);
                setError(null);
            },
            (error) => {
                console.error(`Error in ${collectionName} subscription:`, error);
                setError(error as Error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [collectionName, enabled, JSON.stringify(constraints)]);

    return { data, loading, error };
}

export function useRealtimeDocument<T extends DocumentData & WithId>(
    collectionName: string,
    documentId: string,
    enabled: boolean = true
) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!enabled || !documentId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const docRef = doc(db, collectionName, documentId);

        const unsubscribe = onSnapshot(
            docRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    setData({
                        ...snapshot.data(),
                        id: snapshot.id,
                    } as T);
                } else {
                    setData(null);
                }
                setLoading(false);
                setError(null);
            },
            (error) => {
                console.error(`Error in ${collectionName}/${documentId} subscription:`, error);
                setError(error as Error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [collectionName, documentId, enabled]);

    return { data, loading, error };
}

// Helper hook for filtered queries
export function useFilteredCollection<T extends DocumentData & WithId>(
    collectionName: string,
    queryBuilder: (baseQuery: Query<T>) => Query<T>,
    enabled: boolean = true
) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!enabled) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const baseQuery = collection(db, collectionName) as Query<T>;
        const q = queryBuilder(baseQuery);

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const newData = snapshot.docs.map(doc => ({
                    ...doc.data(),
                    id: doc.id,
                }) as T);
                setData(newData);
                setLoading(false);
                setError(null);
            },
            (error) => {
                console.error(`Error in filtered ${collectionName} subscription:`, error);
                setError(error as Error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [collectionName, enabled, queryBuilder]);

    return { data, loading, error };
} 