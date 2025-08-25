import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";

interface GameMenuModalProps {
  isOpen: boolean;
  closeModal: () => void;
  resetGame: () => void;
  backToSettings: () => void;
}

const GameMenuModal = ({ isOpen, closeModal, resetGame, backToSettings }: GameMenuModalProps) => {
  const navigate = useNavigate();

  const handleResume = () => {
    closeModal();
  };

  const handleNewGame = () => {
    resetGame();
    closeModal();
  };

  const handleQuitGame = () => {
    navigate("/");
  };

  const handleGoToSettings = () => {
    backToSettings();
    closeModal();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="game-menu-modal w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-white text-center mb-6">
                  Game Menu
                </Dialog.Title>
                <div className="flex flex-col gap-3">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="game-menu-btn" onClick={handleResume}>
                    Resume Game
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="game-menu-btn" onClick={handleNewGame}>
                    New Game
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="game-menu-btn" onClick={handleGoToSettings}>
                    Go to Settings
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="game-menu-btn quit-btn"
                    onClick={handleQuitGame}
                  >
                    Quit Game
                  </motion.button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default GameMenuModal;
