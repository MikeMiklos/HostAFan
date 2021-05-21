/** @format */

import React, { Fragment, useState, useEffect } from "react";
import { hostListingsCreatedProps } from "./hostProps";
import * as dateService from "../../services/dateService";
import { useHistory } from "react-router-dom";

import PerfectScrollbar from "react-perfect-scrollbar";
import {
  Grid,
  Card,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@material-ui/core";

import StyleTable from "../admin/StyleTable";

import TimeSelectMenu from "./TimeSelectMenu";
import HostListingsMapped from "./HostListingsMapped";

import debug from "sabio-debug";
const _logger = debug.extend("HostListingsCreatedCard");

function HostListingsCreatedCard(props) {
  const timeOptions = ["1 month", "3 months", "6 months", "1 year", "All"];
  const defaultTimeOption = 3;
  const [listings, setListings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [mappedListings, setMappedListings] = useState([]);
  const [displayPeriod, setDisplayPeriod] = useState(30);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteListingId, setDeleteListingId] = useState(0);

  const history = useHistory();

  useEffect(() => {
    if (props.listings !== listings) {
      setListings(props.listings);
      setMappedListings(
        props.listings
          .filter(filterListingsByDate)
          .filter(filterListingsByStatus)
          .map(mapListings)
      );
    }
    if (props.properties !== properties) {
      setProperties(props.properties);
    }
  }, [props.listings, props.properties]);

  useEffect(() => {
    setMappedListings(
      props.listings
        .filter(filterListingsByDate)
        .filter(filterListingsByStatus)
        .map(mapListings)
    );
  }, [displayPeriod]);

  const requestMenuItem = (menuSelection) => {
    _logger("Date range changed.");
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

  const filterListingsByDate = (listing) => {
    const eventStartDateDiff = dateService.getDayDiff(
      new Date(Date.now()),
      listing.event.dateStart
    );
    // If the display period selected is 1 year or less, only show future listings
    if (displayPeriod <= 365) {
      return eventStartDateDiff < displayPeriod && eventStartDateDiff > 0;
    } else {
      // If the display period selected is "All", show all listings (even past listings)
      return true;
    }
  };

  const filterListingsByStatus = (listing) => {
    // If the display period selected is 1 year or less, only show active listings.
    if (displayPeriod <= 365) {
      return listing.isActive;
    } else {
      // If the display period selected is "All", don't filter out any listings.
      return true;
    }
  };

  const viewMore = (target) => {
    switch (target.name) {
      case "listing":
        const targetListing = props.listings.find(
          (listing) => listing.id === parseInt(target.id)
        );
        targetListing.pushedFromHost = true;
        history.push(`/ListingDetails/${target.id}`, {
          type: "LISTING_DATA",
          payload: targetListing,
        });
        break;
      case "property":
        history.push(`/hosts/${target.id}/profile`);
        break;
      case "venue":
        history.push(`/venueinfo/${target.id}`);
        break;
    }
  };

  const mapListings = (listing) => {
    let property = {
      id: null,
      type: null,
      name: null,
    };
    if (properties.length > 0 && listing.serviceType.id === 1) {
      // Not all listings will be associated with a property (rideshare) in the future
      const targetProperty = properties.find(
        (prop) => prop.id === listing.listingProfile.Id
      );
      if (targetProperty === undefined) {
        // ^-- This is a bug fix that protects against bad data in the db where the property may not have been created by the host
        property = {
          id: listing.event.venue.id,
          type: "venue",
          name: listing.event.venue.name,
        };
      } else {
        property = {
          id: targetProperty.id,
          type: "property",
          name: targetProperty.internalName,
        };
      }
    } else {
      property = {
        id: listing.event.venue.id,
        type: "venue",
        name: listing.event.venue.name,
      };
    }

    return (
      <tr key={`listing_${listing.id}`}>
        <HostListingsMapped
          listing={listing}
          property={property}
          delete={handleDelete}
          viewMore={viewMore}
        />
      </tr>
    );
  };

  const toggleDialog = () => {
    if (deleteDialogOpen) {
      setDeleteListingId(0);
    }
    setDeleteDialogOpen(!deleteDialogOpen);
  };

  const handleDelete = (id) => {
    _logger("Handle delete with Id: ", id);
    setDeleteListingId(parseInt(id));
    toggleDialog();
  };

  const confirmDelete = () => {
    _logger(`Delete listing id# ${deleteListingId} now.`);
    props.deleteListing(deleteListingId);
    toggleDialog();
  };

  return (
    <Fragment>
      <Grid item xs={12} lg={6}>
        <Card className="card-box mb-4">
          <div className="card-header" style={{ backgroundColor: "#5E3267" }}>
            <div className="card-header--title font-weight-bold">
              <b style={{ color: "white" }}>Listings Created</b>
            </div>
            <div className="card-header--actions d-flex">
              <Button
                onClick={() => history.push(`/listingform`)}
                color="primary"
                size="small"
                className="bg-plum-plate text-white mx-2"
                autoFocus
              >
                Add New
              </Button>
              <TimeSelectMenu
                options={timeOptions}
                reqFunc={requestMenuItem}
                defaultTimeOption={defaultTimeOption}
              ></TimeSelectMenu>
            </div>
          </div>
          <PerfectScrollbar className="scroll-area-md mb-2">
            <div className="table">
              <table style={{ width: "100%" }} className="table mb-0">
                <colgroup>
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "30%" }} />
                  <col style={{ width: "15%" }} />
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "15%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th style={{ verticalAlign: "middle" }}>Date</th>
                    <th style={{ verticalAlign: "middle" }}>Listing Title</th>
                    <th style={{ verticalAlign: "middle" }}>Services</th>
                    <th style={{ verticalAlign: "middle" }}>Location</th>
                    <th
                      style={{ verticalAlign: "middle", textAlign: "center" }}
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mappedListings.length > 0 ? (
                    mappedListings
                  ) : (
                    <tr
                      key={`listing_none`}
                      className="text-left text-bold text-white "
                      style={{ background: StyleTable.roleChipColor[1] }}
                    >
                      <td colSpan="5">No current listings.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </PerfectScrollbar>
          <div
            className="card-footer d-flex justify-content-between"
            style={{ backgroundColor: "#5E3267" }}
          ></div>
        </Card>
      </Grid>
      <Dialog
        open={deleteDialogOpen}
        onClose={toggleDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        classes={{ paper: "modal-dark bg-plum-plate" }}
      >
        <DialogTitle id="alert-dialog-title" className="text-center">
          Warning
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="alert-dialog-description"
            className="text-white"
          >
            Are you sure you want to delete this listing?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={toggleDialog}
            color="primary"
            className="bg-strong-bliss text-white"
            autoFocus
          >
            No
          </Button>
          <Button
            onClick={confirmDelete}
            color="primary"
            className="bg-warning text-white ml-auto"
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
}

HostListingsCreatedCard.propTypes = hostListingsCreatedProps;

export default HostListingsCreatedCard;
