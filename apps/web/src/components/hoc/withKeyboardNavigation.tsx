import React, { ComponentType } from 'react';
import { useKeyboardNavigation } from '../../contexts/KeyboardContext';

interface WithKeyboardNavigationProps {
    items: any[];
    onSelect?: (item: any) => void;
    keyboardEnabled?: boolean;
}

export function withKeyboardNavigation<P extends WithKeyboardNavigationProps>(
    WrappedComponent: ComponentType<P>
) {
    return function WithKeyboardNavigationComponent(props: P) {
        const { items, onSelect, keyboardEnabled = true, ...rest } = props;

        const handleSelect = (index: number) => {
            if (onSelect && items[index]) {
                onSelect(items[index]);
            }
        };

        const { focusedIndex, setFocusedIndex } = useKeyboardNavigation(
            items.length,
            handleSelect
        );

        const enhancedProps = {
            ...rest,
            items: items.map((item, index) => ({
                ...item,
                isFocused: keyboardEnabled && index === focusedIndex,
                onFocus: () => setFocusedIndex(index),
            })),
            onSelect,
        } as P;

        return <WrappedComponent {...enhancedProps} />;
    };
}

// Example usage:
interface ListItemProps {
    id: string;
    title: string;
    isFocused?: boolean;
    onFocus?: () => void;
}

interface ListProps {
    items: ListItemProps[];
    onSelect?: (item: ListItemProps) => void;
}

export const KeyboardNavigableList = withKeyboardNavigation<ListProps>(
    function List({ items, onSelect }) {
        return (
            <div role="listbox" className="space-y-2">
                {items.map((item) => (
                    <div
                        key={item.id}
                        role="option"
                        aria-selected={item.isFocused}
                        tabIndex={item.isFocused ? 0 : -1}
                        className={`p-4 rounded ${item.isFocused
                                ? 'bg-blue-100 dark:bg-blue-900 outline-none ring-2 ring-blue-500'
                                : 'bg-white dark:bg-gray-800'
                            }`}
                        onClick={() => onSelect?.(item)}
                        onFocus={item.onFocus}
                    >
                        {item.title}
                    </div>
                ))}
            </div>
        );
    }
); 