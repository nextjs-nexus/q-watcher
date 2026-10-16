import WatchStatusFilter from './WatchStatusFilter';
import TypeFilter from "./TypeFilter";
import GenreFilter from "./GenreFilter";
import SearchBar from "./SearchBar";
import UserNav from "./UserNav";

export default function Header() {
    return (
        <>
            <TypeFilter />
            <GenreFilter />
            <div className="w-full max-w-md lg:min-w-0 lg:flex-1">
                <SearchBar />
            </div>
            <WatchStatusFilter />
            <div className="lg:ml-auto lg:shrink-0">
                <UserNav />
            </div>
        </>
    );
}
