
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
import { useToast } from '@/components/ui/use-toast';

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
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (!enabled) {
            setLoading(false);
            return;
        }

        const collectionRef = collection(db, collectionName);
        const q = constraints.length > 0 ? query(collectionRef, ...constraints) : collectionRef;

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const items = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as T[];
                setData(items);
                setLoading(false);
                setError(null);
            },
            (error) => {
                console.error(`Error fetching collection ${collectionName}:`, error);
                setError(error);
                setLoading(false);
                toast({
                    title: 'Error',
                    description: `Failed to fetch data: ${error.message}`,
                    variant: 'destructive',
                });
            }
        );

        return () => unsubscribe();
    }, [collectionName, constraints, enabled, toast]);

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
    const { toast } = useToast();

    useEffect(() => {
        if (!enabled) {
            setLoading(false);
            return;
        }

        const docRef = doc(db, collectionName, documentId);

        const unsubscribe = onSnapshot(
            docRef,
            (doc) => {
                if (doc.exists()) {
                    setData({ id: doc.id, ...doc.data() } as T);
                } else {
                    setData(null);
                }
                setLoading(false);
                setError(null);
            },
            (error) => {
                console.error(`Error fetching document ${documentId}:`, error);
                setError(error);
                setLoading(false);
                toast({
                    title: 'Error',
                    description: `Failed to fetch document: ${error.message}`,
                    variant: 'destructive',
                });
            }
        );

        return () => unsubscribe();
    }, [collectionName, documentId, enabled, toast]);

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