import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { motion } from "framer-motion";
import type { TicTacToeGameSettings } from "../../core/models/TicTacToeModels";
import { GameMode, Difficulty } from "../../core/enum/TicTacToeEnums";

interface ViewSettingsModalProps {
  isOpen: boolean;
  closeModal: () => void;
  settings: TicTacToeGameSettings;
}

const ViewSettingsModal = ({ isOpen, closeModal, settings }: ViewSettingsModalProps) => {
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
                  Current Game Settings
                </Dialog.Title>
                
                <div className="flex flex-col gap-4">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-purple-400 font-semibold mb-1">Game Mode</h4>
                    <p className="text-white">{settings.gameMode === GameMode.SINGLE ? "Single Player" : "Two Players"}</p>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-purple-400 font-semibold mb-1">Player 1</h4>
                    <p className="text-white">{settings.player1Name || "Player 1"}</p>
                  </div>

                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-purple-400 font-semibold mb-1">Player 2</h4>
                    <p className="text-white">{settings.gameMode === GameMode.SINGLE ? "Computer" : (settings.player2Name || "Player 2")}</p>
                  </div>

                  {settings.gameMode === GameMode.SINGLE && (
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h4 className="text-purple-400 font-semibold mb-1">Difficulty Level</h4>
                      <p className="text-white">
                        {settings.difficulty === Difficulty.EASY ? "Easy" : 
                          settings.difficulty === Difficulty.MEDIUM ? "Medium" : "Hard"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <motion.button 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }} 
                    className="game-menu-btn" 
                    onClick={closeModal}
                  >
                    Close
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

export default ViewSettingsModal;
