import React from "react";

const Navbar = () => {
  return (
        <header className="col-span-12 flex justify-between items-center px-6 py-4 bg-gray-100 border-b">
            <h1 className="text-lg font-semibold">
                Bienvenido, Name User//
            </h1>

            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                👤
            </div>
        </header>
  );
};

export default Navbar;