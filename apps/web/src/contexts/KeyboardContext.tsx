import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';

interface KeyboardContextType {
    isKeyboardUser: boolean;
    setIsKeyboardUser: (value: boolean) => void;
}

const KeyboardContext = createContext<KeyboardContextType | undefined>(undefined);

export function KeyboardProvider({ children }: PropsWithChildren) {
    const [isKeyboardUser, setIsKeyboardUser] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Tab') {
                setIsKeyboardUser(true);
            }
        };

        const handleMouseDown = () => {
            setIsKeyboardUser(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('mousedown', handleMouseDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('mousedown', handleMouseDown);
        };
    }, []);

    return (
        <KeyboardContext.Provider value={{ isKeyboardUser, setIsKeyboardUser }}>
            {children}
        </KeyboardContext.Provider>
    );
}

export function useKeyboardContext() {
    const context = useContext(KeyboardContext);
    if (context === undefined) {
        throw new Error('useKeyboardContext must be used within a KeyboardProvider');
    }
    return context;
}

// Custom hook for keyboard navigation
export function useKeyboardNavigation(
    itemsLength: number,
    onSelect: (index: number) => void,
    initialIndex = 0
) {
    const [focusedIndex, setFocusedIndex] = useState(initialIndex);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowDown':
                case 'ArrowRight':
                    e.preventDefault();
                    setFocusedIndex((prev) => (prev + 1) % itemsLength);
                    break;
                case 'ArrowUp':
                case 'ArrowLeft':
                    e.preventDefault();
                    setFocusedIndex((prev) => (prev - 1 + itemsLength) % itemsLength);
                    break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    onSelect(focusedIndex);
                    break;
                case 'Home':
                    e.preventDefault();
                    setFocusedIndex(0);
                    break;
                case 'End':
                    e.preventDefault();
                    setFocusedIndex(itemsLength - 1);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [itemsLength, onSelect, focusedIndex]);

    return {
        focusedIndex,
        setFocusedIndex,
    };
} 