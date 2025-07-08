"use client";

import { useParams } from "next/navigation";
import { useTheme } from "@/app/themeContext";
import { useMediaQuery } from "react-responsive";
import { useEffect, useRef, useState } from "react";
import { useUser } from "@/app/context/UserContext";
import { Partnership } from "@/app/components/collaboration/CollaborationCard";
import { Maximize, Minimize, X } from "lucide-react";
import SplitPane from "split-pane-react";
import "split-pane-react/esm/themes/default.css";
import { getCollabById } from "@/app/api/actions/collaboration/getCollabById";
import toast from "react-hot-toast";
import CollaborationSidebar from "@/app/components/collaboration/CollaborationSidebar";
import TeamChatView from "@/app/components/teams/TeamChatView";
import NotesFolders from "@/app/components/teams/NoteFolder";
import NoteEditor from "@/app/components/teams/NoteEditor";
import CollaborationChatView from "@/app/components/collaboration/CollaborationChatView";
import CollabMemberBar from "@/app/components/collaboration/CollaborationMemberBar";
import CollaborationVideoCallView from "@/app/components/collaboration/video call/CollaborationVideoCallView";
import MainNavbar from "@/app/components/navbars/MainNavbar";

export default function CollaborationPage() {
  const { collaborationId } = useParams<{ collaborationId: string }>();
  const { theme } = useTheme();
  // const isSmallScreen = useMediaQuery({ maxWidth: 1024 });
  const isSmallScreen = useMediaQuery({ maxWidth: 768 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isSmallScreen);
  const { currentUser } = useUser();
  const [partnership, setPartnership] = useState<Partnership | null>(null);
  const isOwner = partnership?.ownerId === currentUser?.id;
  const [layoutType, setLayoutType] = useState<"custom" | "free">("custom");
  const [panelSizes, setPanelSizes] = useState<number[]>([100]);
  const [panelCount, setPanelCount] = useState(1);
  const [activePanelIndex, setActivePanelIndex] = useState(0);
  const [panelContents, setPanelContents] = useState<string[]>(["Chat"]);
  const [previousState, setPreviousState] = useState({
    panelSizes: [100],
    panelCount: 1,
    panelContents: ["Chat"],
  });
  const [panelWidths, setPanelWidths] = useState<number[]>([0]);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPartnership = async () => {
      if (!collaborationId || !currentUser?.id) {
        toast.error("Invalid collaboration or user ID");
        return;
      }
      try {
        const res = await getCollabById(collaborationId);
        setPartnership(res);
      } catch (error) {
        console.error("Error fetching partnership:", error);
        toast.error("Failed to load partnership data.");
      }
    };
    fetchPartnership();
  }, [collaborationId, currentUser?.id]);

  useEffect(() => {
    const updateWidths = () => {
      const widths = panelRefs.current.map((ref) => ref?.offsetWidth || 0);
      setPanelWidths(widths);
    };
    updateWidths();
    window.addEventListener("resize", updateWidths);
    return () => window.removeEventListener("resize", updateWidths);
  }, [panelSizes, panelCount]);

  const handleSectionSelect = (section: string) => {
    const newContents = [...panelContents];
    newContents[activePanelIndex] = section;
    setPanelContents(newContents);
  };

  const handleOpenFolder = (folderId: string) => {
    setSelectedFolderId(folderId);
  };

  const renderSectionContent = (index: number) => {
    const isExpanded = panelSizes[index] === 100;

    return (
      <div
        className={`p-2 h-full ${theme === "light" ? "bg-white" : "bg-slate-900"} 
        ${index === activePanelIndex ? "relative before:absolute before:top-2 before:left-[50%] before:w-10 before:h-3 before:bg-fuchsia-500 before:rounded-full" : ""} 
        ${index < panelCount - 1 && !isExpanded ? "border-r border-gray-200" : ""}`}
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
        <div className="flex justify-end -mt-1">
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
              onClick={() => deexpandPanel()}
              className={`p-1 ml-1 rounded-xl ${theme === "light" ? "text-neutral-800 hover:bg-neutral-100" : "text-white hover:bg-slate-700"}`}
            >
              <Minimize size={15.5} />
            </button>
          )}
        </div>
        {panelContents[index] === "Chat" ? (
          <div className="h-full">
            <CollaborationChatView partnershipId={collaborationId} />
          </div>
        ) : panelContents[index] === "Notes" ? (
          <div className="overflow-y-auto h-[84vh] w-full p-4">
            {selectedFolderId === null ? <div className="text-gray-500">Notes(coming soon)</div> : ""}
          </div>
        ) : panelContents[index] === "Emails" ? (
          <div className="text-gray-500">Emails (Coming Soon)</div>
        ) : panelContents[index] === "Video call" ? (
          <div className="h-full">
            <CollaborationVideoCallView partnershipId={collaborationId} />
          </div>) : panelContents[index] === "Summary" ? (
            <div className="text-gray-500">Summary (Coming Soon)</div>
          ) : (
          <div className="text-gray-500">Select a section</div>
        )}
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

  const deexpandPanel = () => {
    setPanelSizes(previousState.panelSizes);
  };

  console.log("partnership: ", partnership)

  if (!partnership) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`flex min-h-screen w-full ${theme === "light" ? "bg-white" : "bg-slate-900"} transition-colors duration-300`}>
      <CollaborationSidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isSmallScreen={isSmallScreen}
        onSectionSelect={handleSectionSelect}
        partnership={partnership}
      />
      <MainNavbar
        themeButton={true}
        showToggleSidebarButton={false}
        isSidebarOpen={isSidebarOpen}
        showNotificationBell={true}
      />
      <main
        // className={`flex-1 p-4 sm:p-6 transition-all duration-300 w-full ${isSidebarOpen && !isSmallScreen ? "lg:max-w-[calc(100%-12rem)] ml-40" : "max-w-full"
        className={`flex-1 p-1 sm:p-2 md:p-4 transition-all duration-300 w-full ${isSidebarOpen && !isSmallScreen ? 'lg:max-w-[calc(100%-12rem)] ml-40' : 'max-w-full'}`}
          
        style={{ paddingTop: "calc(5rem + env(safe-area-inset-top, 0px))" }}
      >
        <CollabMemberBar partnership={partnership} />
        <div className="h-full w-full">
          {panelCount > 0 ? (
            <SplitPane
              split="vertical"
              sizes={panelSizes}
              onChange={(sizes) => {
                const validSizes = sizes.map((size) => Math.max(10, size));
                const total = validSizes.reduce((a, b) => a + b, 0);
                setPanelSizes(validSizes.map((size) => (size / total) * 100));
              }}
              sashRender={() => <div className={`bg-gray-400 w-2  cursor-col-resize ${isSmallScreen ? "hidden" : "block"}`} />}
              allowResize={true}
              style={{ height: "100%", width: "100%", position: "relative" }}
            >
              {Array.from({ length: panelCount }, (_, index) => (
                <div
                  key={index}
                  className="h-full w-full overflow-hidden"
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
}