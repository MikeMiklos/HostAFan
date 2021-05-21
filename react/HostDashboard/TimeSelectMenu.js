/** @format */

import React, { useEffect } from "react";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import Button from "@material-ui/core/Button";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import PropTypes from "prop-types";

function TimeSelectMenu(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  useEffect(() => {
    if (props.defaultTimeOption) {
      setSelectedIndex(props.defaultTimeOption);
      props.reqFunc(props.options[props.defaultTimeOption]);
    }
  }, []);

  const handleClickListItem = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = (event, index, option) => {
    props.reqFunc(option);
    setSelectedIndex(index);
    setAnchorEl(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        variant="outlined"
        color="secondary"
        size="small"
        aria-haspopup="true"
        onClick={handleClickListItem}
        style={{ backgroundColor: "white" }}
      >
        {props.options[selectedIndex]}
        <ArrowDropDownIcon />
      </Button>
      <Menu
        id="lock-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {props.options.map((option, index) => (
          <MenuItem
            key={option}
            selected={index === selectedIndex}
            onClick={(event) => handleMenuItemClick(event, index, option)}
          >
            {option}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
TimeSelectMenu.propTypes = {
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  reqFunc: PropTypes.func.isRequired,
  defaultTimeOption: PropTypes.number,
};

export default TimeSelectMenu;
