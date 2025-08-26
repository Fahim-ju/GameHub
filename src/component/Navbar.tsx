import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { createScope, animate, Scope, stagger, text } from "animejs";
import { useRef, useEffect } from "react";

export const Navbar = () => {
  const root = useRef(null);
  const scope = useRef<Scope>(null);

  useEffect(() => {
    scope.current = createScope({ root }).add(() => {
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
    window.location.href = "/";
  };

  return (
    <>
      <nav
        ref={root}
        className="block w-full px-10 py-3 mx-auto bg-gradient-to-r from-gray-800 via-gray-300 to-gray-600 shadow-md lg:px-10 lg:py-3"
      >
        <div className="flex flex-wrap items-center justify-between text-slate-800">
          <div className="flex shrink-0 items-center logoWithTitle" onClick={handleClick} style={{ cursor: "pointer" }}>
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
                className="block w-full rounded-lg border-0 bg-gray-700/50 py-2 pl-10 pr-3 text-white font-bold text-lg placeholder:text-gray-300 focus:bg-gray-700 focus:ring-0 focus:outline-none sm:text-sm sm:leading-6"
                placeholder="Search games..."
              />
            </div>
          </div>
          <Menu as="div" className="relative ml-3">
            <MenuButton className="relative flex rounded-full bg-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
              <span className="absolute -inset-1.5" />
              <span className="sr-only">Open user menu</span>
              <img
                alt=""
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                className="size-8 rounded-full bg-gray-800 outline -outline-offset-1 outline-white/10"
              />
            </MenuButton>

            <MenuItems
              transition
              className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg outline outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
            >
              <MenuItem>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden">
                  Your profile
                </a>
              </MenuItem>
              <MenuItem>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden">
                  Settings
                </a>
              </MenuItem>
              <MenuItem>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden">
                  Sign out
                </a>
              </MenuItem>
            </MenuItems>
          </Menu>
        </div>
      </nav>
    </>
  );
};
