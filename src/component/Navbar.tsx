import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, MagnifyingGlassIcon, XMarkIcon, PuzzlePieceIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";
import { createScope, animate, createSpring, createDraggable, Scope, stagger, text } from "animejs";
import { useRef, useState, useEffect } from "react";

const navigation = [
  { name: "Games", href: "#", current: true },
  { name: "Leaderboard", href: "#", current: false },
  { name: "Community", href: "#", current: false },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  return (
    <Disclosure as="nav" className="bg-gray-800">
      {({ open }) => (
        <Fragment>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500">
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>

              {/* Logo and navigation */}
              <div className="flex flex-1 items-center justify-between">
                <div className="flex items-center">
                  <div className="flex shrink-0 items-center">
                    <PuzzlePieceIcon className="h-8 w-8 text-indigo-500" />
                    <span className="ml-2 font-['Press_Start_2P'] text-lg text-white">GameHub</span>
                  </div>
                  <div className="hidden sm:ml-8 sm:block">
                    <div className="flex space-x-4">
                      {navigation.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          aria-current={item.current ? "page" : undefined}
                          className={classNames(
                            item.current ? "bg-indigo-600 text-white" : "text-gray-300 hover:bg-indigo-500 hover:text-white",
                            "rounded-md px-3 py-2 text-sm font-medium transition-colors"
                          )}
                        >
                          {item.name}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Search bar */}
                <div className="flex-1 max-w-lg px-4">
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      type="text"
                      className="block w-full rounded-lg border-0 bg-white/5 py-2 pl-10 pr-3 text-white placeholder:text-gray-400 focus:bg-white/10 focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6"
                      placeholder="Search games..."
                    />
                  </div>
                </div>

                {/* Profile dropdown */}
                <div className="flex items-center space-x-4">
                  <Menu as="div" className="relative">
                    <Menu.Button className="relative flex rounded-full ring-2 ring-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
                      <img
                        alt=""
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                        className="size-8 rounded-full bg-gray-800"
                      />
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <a href="#" className={classNames(active ? "bg-gray-100" : "", "block px-4 py-2 text-sm text-gray-700")}>
                              Your Profile
                            </a>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <a href="#" className={classNames(active ? "bg-gray-100" : "", "block px-4 py-2 text-sm text-gray-700")}>
                              Settings
                            </a>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <a href="#" className={classNames(active ? "bg-gray-100" : "", "block px-4 py-2 text-sm text-gray-700")}>
                              Sign out
                            </a>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className={classNames(
                    item.current ? "bg-indigo-600 text-white" : "text-gray-300 hover:bg-indigo-500 hover:text-white",
                    "block rounded-md px-3 py-2 text-base font-medium"
                  )}
                  aria-current={item.current ? "page" : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </Fragment>
      )}
    </Disclosure>
  );
}

export const NavbarNew = () => {
  const root = useRef(null);
  const scope = useRef<Scope>(null);
  const [rotations, setRotations] = useState(0);

  useEffect(() => {
    scope.current = createScope({ root }).add((self) => {
      // Every anime.js instances declared here are now scopped to <div ref={root}>

      // Created a bounce animation loop
      // animate(".logoWithTitle", {
      //   scale: [
      //     { to: 1.25, ease: "inOut(3)", duration: 200 },
      //     { to: 1, ease: createSpring({ stiffness: 300 }) },
      //   ],
      //   loop: true,
      //   loopDelay: 250,
      // });

      // Make the logo draggable around its center
      // createDraggable(".logoWithTitle", {
      //   container: [0, 0, 0, 0],
      //   releaseEase: createSpring({ stiffness: 200 }),
      // });

      // Register function methods to be used outside the useEffect
      // self?.add("rotateLogo", (i) => {
      //   animate(".logoWithTitle", {
      //     rotate: i * 360,
      //     ease: "out(4)",
      //     duration: 1500,
      //   });
      // });

      const { chars } = text.split(".title", { words: false, chars: true });

      animate(chars, {
        // Property keyframes
        y: [
          { to: "-1.75rem", ease: "outExpo", duration: 800 },
          { to: 0, ease: "outBounce", duration: 1000, delay: 200 },
        ],
        // Property specific parameters
        rotate: {
          from: "-1turn",
          delay: 50,
        },
        delay: stagger(50),
        ease: "inOutCirc",
        loopDelay: 3000,
        loop: true,
      });
    });

    // Properly cleanup all anime.js instances declared inside the scope
    return () => scope.current?.revert();
  }, []);

  const handleClick = () => {
    setRotations((prev) => {
      const newRotations = prev + 1;
      // Animate logo rotation on click using the method declared inside the scope
      scope.current?.methods.rotateLogo(newRotations);
      return newRotations;
    });
  };

  return (
    <>
      <nav ref={root} className="block w-full px-4 py-3 mx-auto bg-gray-700 shadow-md lg:px-8 lg:py-3">
        <div className="container flex flex-wrap items-center justify-between text-slate-800">
            <div className="flex shrink-0 items-center logoWithTitle" onClick={handleClick}>
            <img src="/original_logo.gif" alt="GameHub Logo" className="h-15 w-15" />
            <span className="ml-2 mt-5 font-['Orbitron_Variable'] text-xl text-white title">GameHub</span>
            </div>
          <div className="flex-1 max-w-lg px-4">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                className="block w-full rounded-lg border-0 bg-white/5 py-2 pl-10 pr-3 text-white placeholder:text-gray-400 focus:bg-white/10 focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6"
                placeholder="Search games..."
              />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};
