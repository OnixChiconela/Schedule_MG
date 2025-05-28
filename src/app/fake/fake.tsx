{/* <div className='flex justify-center px-20'>
                            <div
                                className={`flex flex-col gap-2 ${theme === 'light'
                                    ? 'bg-neutral-100 text-neutral-700'
                                    : 'bg-slate-700 text-white'} px-2 py-2 rounded-lg w-full`}
                            >
                                <motion.textarea
                                    placeholder={
                                        activeButton === 'create'
                                            ? 'Create a new team...'
                                            : activeButton === 'edit'
                                                ? 'Edit team name...'
                                                : activeButton === 'remove'
                                                    ? 'Remove team...'
                                                    : 'Search or enter command (e.g., "delete where user X exists")...'
                                    }
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    rows={1}
                                    className={`w-full p-1 rounded-lg ${theme === 'light'
                                        ? 'bg-neutral-100 text-neutral-700'
                                        : 'bg-slate-700 text-white'} focus:outline-none resize-none overflow-hidden`}
                                    style={{ minHeight: '2rem' }}
                                    onInput={(e) => {
                                        const target = e.target as HTMLTextAreaElement;
                                        target.style.height = 'auto'; // Reset height to auto to recalculate
                                        target.style.height = `${target.scrollHeight}px`; // Adjust height based on content
                                    }}
                                    whileFocus={{ scale: 1.005 }}
                                />
                                <div className="flex gap-1 mt-1">
                                    <motion.button
                                        className={`px-2 py-1 cursor-pointer rounded-full items-center ${theme === 'light'
                                            ? activeButton === 'create'
                                                ? 'bg-neutral-200 border-2 border-neutral-500'
                                                : 'bg-neutral-100 hover:bg-neutral-200'
                                            : activeButton === 'create'
                                                ? 'bg-neutral-950/50 border-2 border-fuchsia-300/20'
                                                : 'bg-slate-800/50 hover:bg-neutral-800'} flex gap-1`}
                                        variants={buttonVariants}
                                        whileHover="hover"
                                        whileTap="tap"
                                        onClick={handleCreate}
                                    >
                                        <Plus size={16} />
                                        <span className="text-sm">Create</span>
                                    </motion.button>
                                    <motion.button
                                        className={`px-2 py-1 cursor-pointer rounded-full items-center ${theme === 'light'
                                            ? activeButton === 'edit'
                                                ? 'bg-neutral-200 border-2 border-neutral-500'
                                                : 'bg-neutral-100 hover:bg-neutral-200'
                                            : activeButton === 'edit'
                                                ? 'bg-neutral-950/50 border-2 border-fuchsia-300/20'
                                                : 'bg-slate-800/50 hover:bg-neutral-800'} flex gap-1`}
                                        variants={buttonVariants}
                                        whileHover="hover"
                                        whileTap="tap"
                                        onClick={handleEdit}
                                    >
                                        <Edit size={16} />
                                        <span className="text-sm">Edit</span>
                                    </motion.button>
                                    <motion.button
                                        className={`px-2 py-1 cursor-pointer rounded-full items-center ${theme === 'light'
                                            ? activeButton === 'remove'
                                                ? 'bg-neutral-200 border-2 border-neutral-500'
                                                : 'bg-neutral-100 hover:bg-neutral-200'
                                            : activeButton === 'remove'
                                                ? 'bg-neutral-950/50 border-2 border-fuchsia-300/20'
                                                : 'bg-slate-800/50 hover:bg-neutral-800'} flex gap-1`}
                                        variants={buttonVariants}
                                        whileHover="hover"
                                        whileTap="tap"
                                        onClick={handleRemove}
                                    >
                                        <Trash size={16} />
                                        <span className="text-sm">Remove</span>
                                    </motion.button>
                                    {searchQuery && (
                                        <motion.button
                                            onClick={clearSearch}
                                            className={`px-2 py-1 rounded-full ${theme === 'light'
                                                ? 'bg-neutral-100 hover:bg-neutral-200'
                                                : 'bg-slate-800/50 hover:bg-neutral-800'}`}
                                            variants={buttonVariants}
                                            whileHover="hover"
                                            whileTap="tap"
                                        >
                                            <X size={16} />
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                        </div> */}