/** @format */

import React from "react";
import { Grid, Snackbar } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";

import { PageTitle } from "../../layout-components";

import { hostDashboardProps } from "./hostProps";
import { getCurrentVehicles as getVehicles } from "../../services/vehicleService";
import { getCreatedBy as getProperties } from "../../services/hostProfileService";
import { getByCreatedBy as getEvents } from "../../services/eventService";
import {
  getCreatedBy as getListings,
  deleteListing,
} from "../../services/listingService";
import { getByHostId as getReservations } from "../../services/listingReservationService";
import { getCreatedBy as getParking } from "../../services/parkingService";
import { getCreatedBy as getRideshare } from "../../services/rideShareProfileService";

import HostManageSection from "./HostManageSection";
import HostAnalyticsSection from "./HostAnalyticsSection";
import HostUpcomingResCard from "./HostUpcomingResCard";
import HostListingsCreatedCard from "./HostListingsCreatedCard";
// *** Ignore - work in progress ***
// import HostFinancialYearSection from "./HostFinancialYearSection";
// import HostVisitorLocationsSection from "./HostVisitorLocationsSection";
import HostSocialMediaSection from "./HostSocialMediaSection";

import HostFanInfoCard from "./HostFanInfoCard";
import HostCardSection from "./HostCardSection";
import HostFooter from "./HostFooter";

import debug from "sabio-debug";
const _logger = debug.extend("HostDashboard");

class HostDashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      reservations: [],
      vehicles: [],
      properties: [],
      events: [],
      listings: [],
      parking: [],
      rideshare: {},
      snackbar: {
        display: false,
        severity: null,
        message: "",
      },
    };
  }

  componentDidMount() {
    getProperties().then(this.onGetPropertiesSuccess);
    getVehicles().then(this.onGetVehiclesSuccess);
    getEvents().then(this.onGetEventsSuccess);
    getParking().then(this.onGetParkingSuccess);
    getRideshare().then(this.onGetRideshareSuccess);
  }

  onGetPropertiesSuccess = (response) => {
    this.setState(
      () => {
        return { properties: [...response.items] };
      },
      () => {
        // This ensures properties are retrieved prior to sending to the UpcomingListings card
        getListings().then(this.onGetListingsSuccess);
      }
    );
  };

  onGetListingsSuccess = (response) => {
    this.setState(
      () => {
        return { listings: response.items };
      },
      () => {
        // No need to getReservations unless there are listings
        getReservations().then(this.onGetReservationsSuccess);
      }
    );
  };

  onGetReservationsSuccess = (response) => {
    this.setState(() => {
      return { reservations: response.items };
    });
  };

  onGetEventsSuccess = (response) => {
    this.setState(() => {
      return { events: response.items };
    });
  };

  onGetVehiclesSuccess = (response) => {
    this.setState(() => {
      return { vehicles: [...response.items] };
    });
  };

  onGetParkingSuccess = (response) => {
    this.setState(() => {
      return {
        parking: response.items.filter((profile) => profile.status.id !== 3),
      }; //Filter out "deleted"
    });
  };

  onGetRideshareSuccess = (response) => {
    this.setState(() => {
      return {
        rideshare: response.item,
      };
    });
  };

  deleteListing = (id) => {
    _logger(`Delete listing id# ${id} now.`);
    deleteListing(id)
      .then(this.onDeleteListingSuccess)
      .catch(this.onDeleteListingError);
  };

  onDeleteListingSuccess = (response) => {
    _logger("Successfully deleted listing.", response);

    // Update the listing in state
    let updatedListings = [...this.state.listings];
    const tgtIndex = updatedListings.findIndex(
      (listing) => listing.id === response.id
    );
    updatedListings[tgtIndex].isActive = false;
    this.setState(() => {
      return {
        listings: updatedListings,
        snackbar: {
          display: true,
          severity: "success",
          message: "Listing successfully deleted.",
        },
      };
    });
  };

  onDeleteListingError = (error) => {
    _logger("Could not delete listing:  ", error);

    this.setState(() => {
      const snackbar = {
        display: true,
        severity: "error",
        message: "Listing could not be deleted.",
      };
      return { snackbar };
    });
  };

  handleCloseSnackbar = () => {
    this.setState(() => {
      const snackbar = {
        display: false,
        severity: "info",
        message: "",
      };
      return { snackbar };
    });
  };

  render() {
    return (
      <React.Fragment>
        <PageTitle currentUser={this.props.currentUser} />
        <HostAnalyticsSection
          currentUser={this.props.currentUser}
          reservations={this.state.reservations}
        />
        <Grid container spacing={4}>
          <HostUpcomingResCard reservations={this.state.reservations} />
          <HostListingsCreatedCard
            listings={this.state.listings}
            properties={this.state.properties}
            deleteListing={this.deleteListing}
          />
        </Grid>
        <HostCardSection hostItems={this.state} />
        <HostManageSection hostItems={this.state} />
        <HostFanInfoCard />
        {/*  *** Ignore: Work in Progress ***  */}
        {/* <HostSection5 /> */}
        {/* <HostSection7 /> */}
        {/* <Grid container spacing={4}>
          <HostFinancialYearSection />
          <HostVisitorLocationsSection />
        </Grid> */}
        {/*  *** Ignore: Work in Progress ***  */}
        <HostSocialMediaSection />

        <HostFooter />
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={this.state.snackbar.display}
          onClose={this.handleCloseSnackbar}
          autoHideDuration={6000}
        >
          <Alert
            onClose={this.handleCloseSnackbar}
            severity={this.state.snackbar.severity}
          >
            {this.state.snackbar.message}
          </Alert>
        </Snackbar>
      </React.Fragment>
    );
  }
}

HostDashboard.propTypes = hostDashboardProps;

export default HostDashboard;
