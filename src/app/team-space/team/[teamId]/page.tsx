"use client"

import { useTheme } from "@/app/themeContext";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import SplitPane from "split-pane-react";
import "split-pane-react/esm/themes/default.css";
import * as sodium from "libsodium-wrappers";
import { Maximize, Minimize, X } from "lucide-react";
import { useMediaQuery } from "react-responsive";
import { getUserMasterKey } from "@/app/api/actions/user/getUserMasterkey";
import Navbar from "@/app/components/navbars/Navbar";
import TeamSideNavbar from "@/app/components/navbars/TeamNavbar";
import TeamCalendar from "@/app/components/teams/TeamCalendar";
import TeamTasks from "@/app/components/teams/TeamTasks";
import NoteEditor from "@/app/components/teams/NoteEditor";
import NotesFolders from "@/app/components/teams/NoteFolder";
import TeamChatView from "@/app/components/teams/TeamChatView";
import { Team } from "@/app/components/teams/TeamCards";
import { useUser } from "@/app/context/UserContext";

// interface TeamPageProps {
//     team: Team;
// }

export default function TeamPage() {
    const { teamId } = useParams();
    const { theme } = useTheme();
    const isSmallScreen = useMediaQuery({ maxWidth: 1024 });
    const [isSidebarOpen, setIsSidebarOpen] = useState(!isSmallScreen);
    const { currentUser } = useUser()
    const [decryptedName, setDecryptedName] = useState("");
    const [decryptedDescription, setDecryptedDescription] = useState("");
    const [layoutType, setLayoutType] = useState<"custom" | "free">("custom");
    const [panelSizes, setPanelSizes] = useState<number[]>([100]);
    const [panelCount, setPanelCount] = useState(1);
    const [activePanelIndex, setActivePanelIndex] = useState(0);
    const [panelContents, setPanelContents] = useState<string[]>(["Calendar"]);
    const [previousState, setPreviousState] = useState({ panelSizes: [100], panelCount: 1, panelContents: ["Calendar"] });

    const [team, setTeam] = useState<Team | null>(null)
    const isOwner = team?.role === "OWNER";
    const [panelWidths, setPanelWidths] = useState<number[]>([0]);

    const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const decryptedData = async () => {
            if (!team) {
                return
            }
            try {
                await sodium.ready;
                const userMasterKey = await getUserMasterKey(currentUser!.id);
                if (!userMasterKey) throw new Error("Failed to retrieve master key");
                const masterKeyBuffer = Buffer.from(userMasterKey, "base64");

                const userKeyEntry = team.encryptedKeys[currentUser!.id];
                if (
                    !userKeyEntry ||
                    !userKeyEntry.encryptedKey ||
                    !userKeyEntry.nonce ||
                    !team.nameNonce ||
                    !team.descriptionNonce
                ) {
                    throw new Error("Missing or invalid encrypted data");
                }

                const encryptedKeyBuffer = Buffer.from(userKeyEntry.encryptedKey, "base64");
                const keyNonceBuffer = Buffer.from(userKeyEntry.nonce, "base64");
                const originalKey = sodium.crypto_secretbox_open_easy(
                    encryptedKeyBuffer,
                    keyNonceBuffer,
                    masterKeyBuffer
                );

                const encryptedNameBuffer = Buffer.from(team.encryptedName, "base64");
                const nameNonceBuffer = Buffer.from(team.nameNonce, "base64");
                const decryptedNameResult = sodium.crypto_secretbox_open_easy(
                    encryptedNameBuffer,
                    nameNonceBuffer,
                    originalKey
                );
                setDecryptedName(Buffer.from(decryptedNameResult).toString("utf8"));

                if (team.description) {
                    const encryptedDescriptionBuffer = Buffer.from(team.description, "base64");
                    const descriptionNonceBuffer = Buffer.from(team.descriptionNonce, "base64");
                    const decryptedDescriptionResult = sodium.crypto_secretbox_open_easy(
                        encryptedDescriptionBuffer,
                        descriptionNonceBuffer,
                        originalKey
                    );
                    setDecryptedDescription(Buffer.from(decryptedDescriptionResult).toString("utf8"));
                }
            } catch (error) {
                console.error("Error decrypting team data:", error);
                setDecryptedName(`Decryption Error: ${team.encryptedName}`);
                setDecryptedDescription(
                    team.description ? `Decryption Error: ${team.description}` : ""
                );
            }
        };

        if (team) decryptedData();
    }, [team, currentUser]);

    useEffect(() => {
        const updateWidths = () => {
            const widths = panelRefs.current.map((ref) => ref?.offsetWidth || 0);
            setPanelWidths(widths);
        };
        updateWidths();
        window.addEventListener("resize", updateWidths);
        return () => window.removeEventListener("resize", updateWidths);
    }, [panelSizes, panelCount]);

    const toggleLayout = async () => {
        setLayoutType(layoutType === "custom" ? "free" : "custom");
        await fetch("/api/teams/save-layout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ teamId, layoutType, panelSizes, panelCount, panelContents }),
        });
    };

    useEffect(() => {
        const syncLayout = async () => {
            const response = await fetch(`/api/teams/get-layout?teamId=${teamId}`);
            const { layoutType, panelSizes, panelCount, panelContents } = await response.json();
            setLayoutType(layoutType);
            setPanelSizes(panelSizes || [100]);
            setPanelCount(panelCount || 1);
            setPanelContents(panelContents || ["Calendar"]);
        };
        if (isOwner) syncLayout();
    }, [teamId, isOwner]);

    const handleSectionSelect = (section: string) => {
        const newContents = [...panelContents];
        newContents[activePanelIndex] = section;
        setPanelContents(newContents);
    };

    const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);

    const handleOpenFolder = (folderId: number) => {
        setSelectedFolderId(folderId);
    };

    const renderSectionContent = (index: number) => {
        const isExpanded = panelSizes[index] === 100;

        return (
            <div
                className={`p-2 h-full ${theme === "light" ? "bg-white" : "bg-slate-900"} ${index === activePanelIndex ? "relative before:absolute before:top-2 before:left-2 before:w-3 before:h-3 before:bg-blue-500 before:rounded-full" : ""} ${index < panelCount - 1 && !isExpanded ? "border-r border-gray-200" : ""}`}
                onClick={() => setActivePanelIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    const item = e.dataTransfer.getData("text/plain");
                    addPanel(item);
                }}
                ref={(el: HTMLDivElement | null) => {
                    panelRefs.current[index] = el;
                }}
            >
                <div className="flex justify-end -mt-2">
                    {!isSmallScreen && panelCount > 1 && (
                        <button
                            onClick={() => removePanel(index)}
                            className={`p-1 rounded-xl ${theme === "light" ? "text-neutral-800 hover:bg-neutral-100" : "text-white hover:bg-slate-700"}`}
                        >
                            <X size={15.5} />
                        </button>
                    )}
                    {!isSmallScreen && !isExpanded && (
                        <button
                            onClick={() => expandPanel(index)}
                            className={`p-1 ml-1 rounded-xl ${theme === "light" ? "text-neutral-800 hover:bg-neutral-100" : "text-white hover:bg-slate-700"}`}
                        >
                            <Maximize size={15.5} />
                        </button>
                    )}
                    {!isSmallScreen && isExpanded && (
                        <button
                            onClick={() => desexpandPanel()}
                            className={`p-1 ml-1 rounded-xl ${theme === "light" ? "text-neutral-800 hover:bg-neutral-100" : "text-white hover:bg-slate-700"}`}
                        >
                            <Minimize size={15.5} />
                        </button>
                    )}
                </div>
                {panelContents[index] === "Calendar" ? (
                    <div className="overflow-x-scroll">
                        <TeamCalendar />
                    </div>
                ) : panelContents[index] === "Tasks" ? (
                    <div className="overflow-y-auto h-[84vh] w-full">
                        <TeamTasks />
                    </div>
                ) : panelContents[index] === "Notes" ? (
                    <div className="overflow-y-auto h-[84vh] w-full p-4">
                        {selectedFolderId === null ? (
                            <NotesFolders onOpenFolder={handleOpenFolder} panelWidth={panelWidths[index] || 0} />
                        ) : (
                            <NoteEditor folderId={selectedFolderId} onBack={() => setSelectedFolderId(null)} />
                        )}
                    </div>
                ) : panelContents[index] === "Quick Notes" ? (
                    "Quick Notes Content"
                ) : panelContents[index] === "Chat" ? (
                    <div>
                        {teamId !== undefined ? <TeamChatView teamId={teamId as string} /> : <p>Team ID not available</p>}
                    </div>
                ) : null}
            </div>
        );
    };

    const addPanel = (section: string) => {
        if (isSmallScreen) {
            setPanelCount(1);
            setPanelSizes([100]);
            setPanelContents([section]);
            setActivePanelIndex(0);
            setPreviousState({ panelSizes: [100], panelCount: 1, panelContents: [section] });
        } else if (panelCount < 3) {
            setPanelCount(panelCount + 1);
            const newSize = 100 / (panelCount + 1);
            setPanelSizes(Array(panelCount + 1).fill(newSize));
            setPanelContents([...panelContents, section]);
            setPreviousState({ panelSizes, panelCount, panelContents });
        }
    };

    const removePanel = (index: number) => {
        if (panelCount > 1) {
            const newSizes = panelSizes.filter((_, i) => i !== index);
            const newContents = panelContents.filter((_, i) => i !== index);
            const newSize = 100 / (panelCount - 1);
            setPanelSizes(newSizes.map(() => newSize));
            setPanelContents(newContents);
            setPanelCount(panelCount - 1);
            setPreviousState({ panelSizes: newSizes.map(() => newSize), panelCount: panelCount - 1, panelContents: newContents });
        }
    };

    const expandPanel = (index: number) => {
        const newSizes = Array(panelCount).fill(0);
        newSizes[index] = 100;
        setPanelSizes(newSizes);
        setPreviousState({ panelSizes, panelCount, panelContents });
    };

    const desexpandPanel = () => {
        setPanelSizes(previousState.panelSizes);
    };

    return (
        <div className={`flex ${theme === "light" ? "bg-white" : "bg-slate-900"} transition-colors duration-300`}>
            <Navbar
                themeButton={true}
                showToggleSidebarButton={true}
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />
            <TeamSideNavbar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} isSmallScreen={isSmallScreen} onSectionSelect={handleSectionSelect} />
            <main
                className={`flex-1 p-4 sm:p-6 ${isSmallScreen ? "" : ""} max-w-screen-2xl mx-auto h-screen overflow-auto`}
                style={{ paddingTop: "calc(5rem + env(safe-area-inset-top, 0px))" }}
            >
                <div className="h-full w-full -mt-2">
                    {panelCount > 0 ? (
                        <SplitPane
                            split="vertical"
                            sizes={panelSizes}
                            onChange={(sizes) => {
                                const validSizes = sizes.map((size) => Math.max(10, size));
                                const total = validSizes.reduce((a, b) => a + b, 0);
                                setPanelSizes(validSizes.map((size) => (size / total) * 100));
                            }}
                            sashRender={() => <div className="bg-gray-400 w-2 cursor-col-resize" />}
                            allowResize={true}
                            style={{ height: "100%", width: "100%" }}
                        >
                            {Array.from({ length: panelCount }, (_, index) => (
                                <div
                                    key={index}
                                    className="h-full w-full"
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        const item = e.dataTransfer.getData("text/plain");
                                        addPanel(item);
                                    }}
                                >
                                    {renderSectionContent(index)}
                                </div>
                            ))}
                        </SplitPane>
                    ) : (
                        <div
                            className="h-full w-full flex items-center justify-center text-gray-500"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                const item = e.dataTransfer.getData("text/plain");
                                addPanel(item);
                            }}
                        >
                            Drag an item from the sidebar to create a panel
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

// export default TeamPage;