import React, { Fragment } from "react";
import PropTypes from "prop-types";
import ResDetailsPopup from "./ResDetailsPopup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Avatar, Checkbox } from "@material-ui/core";
import StyleTable from "./StyleTableReservations";
import Chip from "@material-ui/core/Chip";

import { formatDateShort } from "../../services/dateService";

// import debug from "sabio-debug";
// const _logger = debug.extend("ReservationDisplay");

const ReservationDisplay = (props) => {
  const reservation = props.reservation;

  const selectRes = () => {
    props.selectRes(reservation.id);
  };

  // This sets a 1-day buffer, so that an Admin cannot select a reservation that hasn't happened yet.
  let dateCutoff = new Date();
  dateCutoff.setDate(dateCutoff.getDate() - 1);

  return (
    <Fragment>
      <td className="text-center">{reservation.id}</td>
      <td>{formatDateShort(reservation.dateCheckIn)}</td>
      <td>{formatDateShort(reservation.dateCheckOut)}</td>
      <td className="text-left">
        {/*Res Status */}
        <Chip
          color={"primary"}
          style={{
            backgroundColor: StyleTable.statusChipColor[reservation.statusId],
          }}
          avatar={
            <Avatar
              style={{
                backgroundColor:
                  StyleTable.statusChipColor[reservation.statusId],
              }}
            >
              <FontAwesomeIcon
                icon={["far", StyleTable.iconPicker[reservation.statusId]]}
                className="font-size-lg"
              />
            </Avatar>
          }
          label={
            props.statusLabel === "Inactive" ? "Complete" : props.statusLabel
          }
        />
      </td>
      <td className="d-flex align-items-center">
        <Avatar
          alt="..."
          src={reservation.createdBy.avatarUrl}
          className="mr-2"
        />
        <div className=" d-xl-block pl-3">
          <div className="font-weight-bold pt-2 line-height-1">
            {reservation.createdBy.firstName} {reservation.createdBy.lastName}
          </div>
        </div>
      </td>
      <td className="text-center">
        <ResDetailsPopup reservation={reservation}></ResDetailsPopup>
      </td>
      <td className="text-center">
        <Checkbox
          checked={props.isSelected}
          onChange={selectRes}
          disabled={
            reservation.statusId !== 1 ||
            Date.parse(reservation.dateCheckOut) > Date.parse(dateCutoff)
          }
        ></Checkbox>
      </td>
    </Fragment>
  );
};

ReservationDisplay.propTypes = {
  reservation: PropTypes.shape({
    id: PropTypes.number.isRequired,
    statusId: PropTypes.number.isRequired,
    dateCheckIn: PropTypes.string.isRequired,
    dateCheckOut: PropTypes.string.isRequired,
    createdBy: PropTypes.shape({
      id: PropTypes.number.isRequired,
      avatarUrl: PropTypes.string,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
    }),
  }),
  selectRes: PropTypes.func.isRequired,
  isSelected: PropTypes.bool.isRequired,
  statusLabel: PropTypes.string.isRequired,
};

export default ReservationDisplay;
