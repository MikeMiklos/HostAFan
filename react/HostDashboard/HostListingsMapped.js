/** @format */

import React, { Fragment } from "react";
import { hostListingsMappedProps } from "./hostProps";
import * as dateService from "../../services/dateService";
import { useHistory } from "react-router-dom";

import { IconButton, Button, Tooltip } from "@material-ui/core";

import EditIcon from "@material-ui/icons/Edit";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import debug from "sabio-debug";
const _logger = debug.extend("HostListingsMapped");

function HostListingsMapped(props) {
  const history = useHistory();
  const listing = props.listing;
  const property = props.property;

  const mapServices = (listing) => {
    const stay = listing.serviceType.id === 1;
    const ride =
      listing.serviceType.id === 2 ||
      (listing.additionalServices &&
        listing.services &&
        listing.services.findIndex((serv) => {
          return serv.serviceTypeId === 2;
        }) !== -1);

    const parking =
      listing.serviceType.id === 3 ||
      (listing.additionalServices &&
        listing.services.findIndex((serv) => {
          return serv.serviceTypeId === 3;
        }) !== -1);

    const hostEvent = listing.serviceType.id === 4;

    return (
      <Fragment>
        {stay && (
          <FontAwesomeIcon
            icon={["fas", "home"]}
            className="text-default font-size-lg mr-2"
          />
        )}
        {ride && (
          <FontAwesomeIcon
            icon={["fas", "car"]}
            className="text-default font-size-lg mr-2"
          />
        )}
        {parking && (
          <FontAwesomeIcon
            icon={["fas", "parking"]}
            className="text-default font-size-lg"
          />
        )}
        {hostEvent && (
          <FontAwesomeIcon
            icon={["fas", "people-arrows"]}
            className="text-default font-size-lg"
          />
        )}
      </Fragment>
    );
  };

  const getBadge = (listing) => {
    if (!listing.isActive) {
      return (
        <div className="text-center">
          <Tooltip title="Listing is inactive.">
            <div className="h-auto py-0 px-3 badge badge-danger">inActive</div>
          </Tooltip>
        </div>
      );
    } else if (listing.hasReservation) {
      return (
        <div className="text-center">
          <Tooltip title="Listing has a confirmed reservation.">
            <div className="h-auto py-0 px-3 badge badge-info">Reserved</div>
          </Tooltip>
        </div>
      );
    } else {
      return (
        <div className="text-center">
          <Tooltip title="Listing is active.">
            <div className="h-auto py-0 px-3 badge badge-success">Active</div>
          </Tooltip>
        </div>
      );
    }
  };

  const viewMoreClick = (e) => {
    const currentTarget = {
      name: e.currentTarget.name,
      id: e.currentTarget.id,
    };
    props.viewMore(currentTarget);
  };

  const editClick = (e) => {
    _logger("Edit listing....");
    history.push(`/listingForm/${e.currentTarget.id}`);
  };

  const deleteClick = (e) => {
    _logger("Delete listing....");
    props.delete(e.currentTarget.id);
  };

  return (
    <Fragment>
      <td>{dateService.formatDateShort(new Date(listing.event.dateStart))}</td>
      <td>
        <Tooltip title="Go to listing details.">
          <Button
            name="listing"
            id={listing.id}
            onClick={viewMoreClick}
            className="pl-0 pr-0 text-capitalize text-left btn-inverse d-flex align-items-center"
            style={{ boxShadow: "none" }}
          >
            {listing.title}
          </Button>
        </Tooltip>
      </td>
      <td style={{ verticalAlign: "middle" }}>{mapServices(listing)}</td>
      <td>
        {property.name && (
          <Tooltip title="Go to property/location details.">
            <Button
              name={property.type}
              id={property.id}
              onClick={viewMoreClick}
              className="pl-0 pr-0 text-capitalize text-left btn-inverse d-flex align-items-center"
              style={{ boxShadow: "none" }}
            >
              {property.name}
            </Button>
          </Tooltip>
        )}
      </td>
      <td style={{ verticalAlign: "middle", textAlign: "center" }}>
        {getBadge(listing)}
        <span>
          <Tooltip
            title={
              listing.hasReservation
                ? "Cannot edit a listing with reservations."
                : "Edit"
            }
          >
            <span>
              <IconButton
                className="p-1"
                id={listing.id}
                color="primary"
                aria-label="edit"
                onClick={editClick}
                disabled={listing.hasReservation}
              >
                <EditIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip
            title={
              listing.hasReservation
                ? "Cannot delete a listing with reservations."
                : !listing.isActive
                ? "Cannot delete a listing that is inactive."
                : "Delete"
            }
          >
            <span>
              <IconButton
                id={listing.id}
                className="p-1"
                color="primary"
                aria-label="delete"
                onClick={deleteClick}
                disabled={listing.hasReservation || !listing.isActive}
              >
                <DeleteForeverIcon />
              </IconButton>
            </span>
          </Tooltip>
        </span>
      </td>
    </Fragment>
  );
}

HostListingsMapped.propTypes = hostListingsMappedProps;

export default HostListingsMapped;
