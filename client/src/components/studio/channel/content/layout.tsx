import { NavLink, Outlet } from "react-router-dom";

export const ContentLayout = () => {
  return (
    <div className="flex flex-col p-4 space-y-4">
      <h1 className="text-2xl font-bold">Channel Content</h1>
      <div className="flex space-x-4 border-b">
        {["videos", "shorts", "posts", "playlists"].map((tab) => (
          <NavLink
            key={tab}
            to={tab}
            className={({ isActive }) =>
              `px-4 py-2 ${
                isActive && "border-b-2 border-primary"
              }`
            }
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  );
};
