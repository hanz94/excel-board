import { createContext, useContext, useState } from 'react';

interface ModalContextType {
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
    currentModalContent: { title: string; content: JSX.Element };
    setCurrentModalContent: (content: { title: string; content: JSX.Element }) => void;
    modalOpen: (content: { title: string; content: JSX.Element }) => void;
    modalClose: () => void;
  }

const ModalContext = createContext<ModalContextType | undefined>(undefined);

const ModalContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentModalContent, setCurrentModalContent] = useState({
        title: "",
        content: <></>,
    });

    const modalOpen = (content: { title: string; content: JSX.Element }) => {
        if (content?.title && content?.content) {
            setCurrentModalContent(content);
            setIsModalOpen(true);
        }
    }

    const modalClose = () => setIsModalOpen(false);

  return <ModalContext.Provider value={{isModalOpen, setIsModalOpen, currentModalContent, setCurrentModalContent, modalOpen, modalClose}}>{children}</ModalContext.Provider>;
}

const useModalContext = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModalContext must be used within a ModalContextProvider');
    }
    return context;
}

export { ModalContextProvider, useModalContext }