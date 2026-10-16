
export default function Footer(){
    const footerClasses = false
        ? "w-full text-[#6B7F75] py-4 mt-6"
        : "w-full bg-[#0B1410] text-white py-8 mt-auto";

    return (
        <footer className={footerClasses}>
            <div className={`${true ? 'max-w-md' : 'max-w-6xl'} mx-auto px-4`}>
                <div className={`flex flex-col ${true ? 'items-center' : 'md:flex-row items-center justify-between'} gap-${true ? '2' : '6'}`}>
                    <div className="text-center md:text-left space-y-2">
                        <p className="text-sm text-[#A0B3A8]">Q-Watcher</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};
