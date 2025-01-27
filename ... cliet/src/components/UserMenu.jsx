import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Divider from "./Divider";

const UserMenu = () => {
  const user = useSelector((state) => state.user);

  return (
    <div>
      <div className="font-semibold">My Account</div>
      <div className="text-sm">{user.name || user.mobile}</div>

      <Divider />

      <div className="text-sm grid gap-2">
        <Link to={""} className="px-2">
          My orders
        </Link>
        <Link to={""} className="px-2">
          Save Address
        </Link>
        <button className="text-left px-2">Log Out</button>
      </div>
    </div>
  );
};

export default UserMenu;
