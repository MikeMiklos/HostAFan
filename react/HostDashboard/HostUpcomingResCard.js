import React, { Fragment, useState, useEffect } from "react";
import { hostUpcomingResCardProps } from "./hostProps";
import * as dateService from "../../services/dateService";
import { useHistory } from "react-router-dom";

import UserCard from "./UserCard";
import PerfectScrollbar from "react-perfect-scrollbar";
import { Grid, Card, Button, Tooltip } from "@material-ui/core";
import StyleTable from "../admin/StyleTable";
import TimeSelectMenu from "./TimeSelectMenu";

function HostUpcomingResCard(props) {
  const timeOptions = ["1 month", "3 months", "6 months", "1 year", "All"];
  const defaultTimeOption = 3;
  const [reservations, setReservations] = useState([]);
  const [mappedReservations, setMappedReservations] = useState([]);
  const [displayPeriod, setDisplayPeriod] = useState(30);
  const history = useHistory();

  useEffect(() => {
    if (props.reservations !== reservations) {
      setReservations(props.reservations);
      setMappedReservations(
        props.reservations
          .filter(filterReservationsByDate)
          .filter(filterReservationsByStatus)
          .map(mapReservations)
      );
    }
  }, [props.reservations]);

  useEffect(() => {
    setMappedReservations(
      props.reservations
        .filter(filterReservationsByDate)
        .filter(filterReservationsByStatus)
        .map(mapReservations)
    );
  }, [displayPeriod]);

  const requestMenuItem = (menuSelection) => {
    switch (menuSelection) {
      case "1 month":
        setDisplayPeriod(30);
        break;
      case "3 months":
        setDisplayPeriod(90);
        break;
      case "6 months":
        setDisplayPeriod(180);
        break;
      case "1 year":
        setDisplayPeriod(365);
        break;
      case "All":
        setDisplayPeriod(5000);
        break;
      default:
        setDisplayPeriod(30);
    }
  };

  const filterReservationsByDate = (res) => {
    const checkOutDateDiff = dateService.getDayDiff(
      new Date(Date.now()),
      res.dateCheckOut
    );
    // If the display period selected is 1 year or less, only show upcoming reservations
    if (displayPeriod <= 365) {
      return checkOutDateDiff < displayPeriod && checkOutDateDiff > 0;
    } else {
      // If the display period selected is "All", show all reservations (even past reservations)
      return true;
    }
  };

  const filterReservationsByStatus = (res) => {
    // If the display period selected is 1 year or less, only show active reservations.
    if (displayPeriod <= 365) {
      return res.statusId === 1;
    } else {
      // If the display period selected is "All", don't filter out any reservations.
      return true;
    }
  };

  const mapReservations = (reservation) => {
    return (
      <tr key={`reservation_${reservation.id}`}>
        <td>
          {dateService.formatDateShort(new Date(reservation.dateCheckIn))}
        </td>
        <td>
          <Tooltip title="Go to reservation details.">
            <Button
              id={reservation.id}
              onClick={handleClick}
              className="pl-0 pr-0 text-capitalize text-left btn-inverse d-flex align-items-center"
              style={{ boxShadow: "none" }}
            >
              {reservation.listing.title}
            </Button>
          </Tooltip>
        </td>
        <td>{<UserCard userInfo={reservation.createdBy} />}</td>
        <td style={{ verticalAlign: "middle", textAlign: "center" }}>
          {getBadge(reservation)}
        </td>
      </tr>
    );
  };

  const getBadge = (res) => {
    switch (res.statusId) {
      case 1:
        return (
          <div className="text-center">
            <Tooltip title="Reservation is confirmed.">
              <div className="h-auto py-0 px-3 badge badge-success">
                Confirmed
              </div>
            </Tooltip>
          </div>
        );
      case 2:
        return (
          <div className="text-center">
            <Tooltip title="Reservation is inactive.">
              <div className="h-auto py-0 px-3 badge badge-info">Inactive</div>
            </Tooltip>
          </div>
        );
      case 3:
        return (
          <div className="text-center">
            <Tooltip title="Reservation is deleted.">
              <div className="h-auto py-0 px-3 badge badge-danger">Deleted</div>
            </Tooltip>
          </div>
        );
      default:
        return (
          <div className="text-center">
            <Tooltip title="Reservation status is unknown.">
              <div className="h-auto py-0 px-3 badge badge-dark">Unknown</div>
            </Tooltip>
          </div>
        );
    }
  };

  const handleClick = (e) => {
    const reservation = props.reservations.find(
      (res) => res.id === parseInt(e.currentTarget.id)
    );
    history.push(`/dashboard/fan/reservationDetails/${e.currentTarget.id}`, {
      type: "LISTING_DATA",
      payload: reservation,
    });
  };

  return (
    <Fragment>
      <Grid item xs={12} lg={6}>
        <Card className="card-box mb-4">
          <div className="card-header" style={{ backgroundColor: "#0E3D8B" }}>
            <div className="card-header--title font-weight-bold">
              <b style={{ color: "white" }}>Upcoming Reservations</b>
            </div>
            <div className="card-header--actions">
              <TimeSelectMenu
                options={timeOptions}
                reqFunc={requestMenuItem}
                defaultTimeOption={defaultTimeOption}
              ></TimeSelectMenu>
            </div>
          </div>
          <PerfectScrollbar className="scroll-area-md mb-2">
            <div className="table">
              <table style={{ width: "100%" }}>
                <colgroup>
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "30%" }} />
                  <col style={{ width: "35%" }} />
                  <col style={{ width: "15%" }} />
                </colgroup>

                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Title</th>
                    <th>Contact</th>
                    <th className="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mappedReservations.length > 0 ? (
                    mappedReservations
                  ) : (
                    <tr
                      className="text-left text-bold text-white "
                      style={{ background: StyleTable.roleChipColor[1] }}
                    >
                      <td colSpan="4">No upcoming reservations.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </PerfectScrollbar>
          <div
            className="card-footer d-flex justify-content-between"
            style={{ backgroundColor: "#0E3D8B" }}
          ></div>
        </Card>
      </Grid>
    </Fragment>
  );
}

HostUpcomingResCard.propTypes = hostUpcomingResCardProps;

export default HostUpcomingResCard;
