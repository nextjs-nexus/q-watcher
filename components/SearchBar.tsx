'use client';

import { Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function SearchBar() {
    const searchParams = useSearchParams();
    const { replace } = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const query = searchParams.get('query') || '';
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    useEffect(() => {
        if (inputRef.current && inputRef.current.value !== query) {
            inputRef.current.value = query;
        }
    }, [query]);

    const handleSearch = (term: string) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        const params = new URLSearchParams(searchParams);
        params.delete('page');
        params.delete('actor');
        if (term.trim()) {
            params.set('query', term.trim());
        } else {
            params.delete('query');
        }
        replace(`/list?${params.toString()}`);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        if (!value.trim()) {
            handleSearch('');
            return;
        }
        timeoutRef.current = setTimeout(() => {
            handleSearch(value);
        }, 500);
    };

    const clearSearch = () => {
        if (inputRef.current) {
            inputRef.current.value = '';
            inputRef.current.focus();
        }
        handleSearch('');
    };

    return (
        <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-[#A0B3A8]" />
            </div>
            <input
                ref={inputRef}
                type="text"
                className="block w-full p-3 pl-10 pr-12 text-sm border rounded-lg bg-[#0B1410] border-[#B6FF3C]/20 placeholder-[#6B7F75] text-white focus:ring-[#B6FF3C] focus:border-[#B6FF3C]"
                placeholder="Search titles or actors..." aria-label="Search titles or actors"
                onChange={handleChange}
                defaultValue={searchParams.get('query')?.toString() || ''}
            />
            <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-[#A0B3A8] hover:text-[#B6FF3C] focus-visible:outline-2 focus-visible:outline-[#B6FF3C]"
            >
                <X className="h-4 w-4" aria-hidden="true" />
            </button>
        </div>
    );
}
