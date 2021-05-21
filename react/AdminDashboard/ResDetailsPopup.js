import React, { Fragment, useState } from "react";

import * as dateService from "../../services/dateService";
import { getListingById } from "../../services/listingService";

import PropTypes from "prop-types";
import { Avatar, Menu, List, ListItem, Divider } from "@material-ui/core";
import Chip from "@material-ui/core/Chip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function ResDetailsPopup(props) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [listing, setListing] = useState(null);
  const reservation = props.reservation;
  const dateCreated = dateService.formatDateShort(reservation.dateCreated);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    if (listing === null) {
      getListingById(reservation.listingId)
        .then(onGetListingSuccess)
        .catch(onGetListingError);
    }
  };

  const onGetListingSuccess = (response) => {
    setListing(response.item.listing);
  };

  const onGetListingError = (error) => {
    _logger(`Error getting listing details:  `, error);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Fragment>
      <Chip color={"primary"} label="View Details" onClick={handleClick} />

      <Menu
        anchorEl={anchorEl}
        keepMounted
        getContentAnchorEl={null}
        open={Boolean(anchorEl)}
        anchorOrigin={{
          vertical: "center",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "center",
          horizontal: "center",
        }}
        onClose={handleClose}
        className="ml-2"
      >
        <div className="dropdown-menu-right dropdown-menu-lg overflow-hidden p-0">
          <List className="text-left bg-transparent d-flex align-items-center flex-column pt-0">
            <div className="pl-3 ">
              <div className="font-weight-bold font-font-size-lg text-center pt-2 pb-1 line-height-1">
                {`Reservation #${reservation.id}`}
              </div>
              <span className="text-black-50 text-center">{`Date Created: ${dateCreated}`}</span>
            </div>
            <Divider className="w-100 mt-2" />
            <ListItem className="py-3" button onClick={handleClose}>
              {listing && (
                <div className="py-2 py-xl-5">
                  <div className="d-block pl-0 pl-xl-3 mt-4">
                    <div className="feature-box mb-4 pr-4">
                      <div className="font-size-md font-weight-bold my-3">
                        Main Event Details: {listing.event.name}
                      </div>
                      <p className="text-black-50 mb-3">
                        {listing.event.shortDescription}
                      </p>
                      <p className="text-black-50 mb-3">
                        {dateService.formatDateTime(listing.event.dateStart)} to{" "}
                        {dateService.formatDateTime(listing.event.dateEnd)}
                      </p>
                    </div>
                    <div className="feature-box mb-4 pr-4">
                      <div className="font-size-md font-weight-bold my-3">
                        Service Type:
                      </div>
                      <p className="text-black-50 mb-3">
                        {listing.serviceType.name}
                      </p>
                    </div>
                    <div className="feature-box pr-4">
                      <div className="font-size-md font-weight-bold my-3">
                        Additional Details:
                      </div>
                      <div className="text-black-50 mb-3">
                        {listing.serviceType.id === 1 ? (
                          <div>
                            <FontAwesomeIcon
                              icon={["fas", "users"]}
                              className="text-primary font-size-lg mr-2"
                            />
                            Guest Capacity:{" "}
                            {listing.listingProfile.GuestCapacity}
                          </div>
                        ) : (
                          `- License Status: ${listing.listingProfile.LicenseStatus}`
                        )}
                      </div>
                      <div className="text-black-50 mb-3">
                        {listing.serviceType.id === 1 ? (
                          <div>
                            <FontAwesomeIcon
                              icon={["fas", "home"]}
                              className="text-primary font-size-lg mr-2"
                            />
                            Bedrooms: {listing.listingProfile.Bedrooms}
                          </div>
                        ) : (
                          `- Insurance Status: ${listing.listingProfile.LicenseStatus}`
                        )}
                      </div>
                      <div className="text-black-50 mb-3">
                        {listing.serviceType.id === 1 ? (
                          <div>
                            <FontAwesomeIcon
                              icon={["fas", "shower"]}
                              className="text-primary font-size-lg mr-2"
                            />
                            Baths : {listing.listingProfile.Baths}
                          </div>
                        ) : (
                          ``
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </ListItem>
            <Divider className="w-100" />
            <ListItem className="p-0">
              <div className="d-flex px-2 align-items-left font-weight-bold">
                Fan:
              </div>
            </ListItem>
            <ListItem className="p-0">
              <div className="grid-menu grid-menu-2col w-100">
                <div className="py-1">
                  <div className="d-flex">
                    <div className="d-flex px-3 align-items-left font-weight-bold"></div>
                    <div className="d-flex pb-2 align-items-center">
                      <Avatar
                        alt="..."
                        src={reservation.createdBy.avatarUrl}
                        className="mr-2"
                      />
                      <div className=" d-xl-block pl-2">
                        <div className="font-weight-bold line-height-1">
                          {reservation.createdBy.firstName}{" "}
                          {reservation.createdBy.lastName}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ListItem>
            <ListItem className="p-0">
              <div className="d-flex px-2 align-items-left font-weight-bold">
                Host:
              </div>
            </ListItem>
            <ListItem className="p-0">
              <div className="grid-menu grid-menu-2col w-100">
                <div className="py-1">
                  <div className="d-flex">
                    <div className="d-flex px-3 align-items-left font-weight-bold"></div>
                    <div className="d-flex pb-2 align-items-center">
                      <Avatar
                        alt="..."
                        src={listing ? listing.createdBy.avatarUrl : null}
                        className="mr-2"
                      />
                      <div className=" d-xl-block pl-2">
                        <div className="font-weight-bold line-height-1">
                          {listing ? listing.createdBy.firstName : null}{" "}
                          {listing ? listing.createdBy.lastName : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ListItem>
            <Divider className="w-100" />
            <ListItem className="d-block rounded-bottom px-3 pt-3 pb-0 text-center"></ListItem>
          </List>
        </div>
      </Menu>
    </Fragment>
  );
}

ResDetailsPopup.propTypes = {
  reservation: PropTypes.shape({
    id: PropTypes.number,
    listingId: PropTypes.number,
    dateCreated: PropTypes.string,
    createdBy: PropTypes.shape({
      userId: PropTypes.number,
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      avatarUrl: PropTypes.string,
    }),
  }).isRequired,
};

export default ResDetailsPopup;
