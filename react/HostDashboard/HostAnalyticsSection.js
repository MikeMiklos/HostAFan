import React, { Fragment, useState, useEffect } from "react";
import { hostAnalyticsProps } from "./hostProps";
import { getDayDiff } from "../../services/dateService";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CompletedIcon from "@material-ui/icons/AssignmentTurnedInTwoTone";
import { Grid, Card, CardContent } from "@material-ui/core";

function HostAnalyticsSection(props) {
  const [secDiff, setSecDiff] = useState(0);
  const [reservations, setReservations] = useState([]);
  const [resCompTotal, setResCompTotal] = useState(0);
  const [resCompLast30Days, setResCompLast30Days] = useState(0);
  const [fansTotal, setFansTotal] = useState(0);
  const [fansLast30Days, setFansLast30Days] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      updateTime();
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (props.reservations !== reservations) {
      setReservations(props.reservations);
      setResCompTotal(getNumResComp());
      setResCompLast30Days(getNumResCompLast30());
      setFansTotal(getNumFans());
      setFansLast30Days(getNumFansLast30());
    }
  }, [props.reservations]);

  const updateTime = () => {
    setSecDiff((new Date() - Date.parse(props.currentUser.dateCreated)) / 1000);
  };

  const getNumResComp = () => {
    return props.reservations.filter(
      (res) => res.statusId === 2 || res.statusId === 8
    ).length; // Check for "Inactive" or "Published"
  };

  const getNumResCompLast30 = () => {
    return props.reservations
      .filter(filterResByTime)
      .filter((res) => res.statusId === 2 || res.statusId === 8).length; // Check for "Inactive" or "Published"
  };

  const getNumFans = () => {
    let uniqueFans = props.reservations
      .map((r) => r.createdBy.id)
      .sort()
      .filter((num, i, arr) => num !== arr[i + 1]);
    return uniqueFans.length;
  };

  const getNumFansLast30 = () => {
    let uniqueFans = props.reservations
      .filter(filterResByTime)
      .map((r) => r.createdBy.id)
      .sort()
      .filter((num, i, arr) => num !== arr[i + 1]);
    return uniqueFans.length;
  };

  const filterResByTime = (res) => {
    const time = 30; // days
    const dayDiff = getDayDiff(res.dateCheckOut, new Date(Date.now()));
    if (dayDiff < time && dayDiff >= 0) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <Fragment>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={6} md={4}>
          <Card className="card-box mb-4">
            <CardContent className="p-3">
              <div className="align-box-row align-items-start">
                <div className="font-weight-bold">
                  <small className="text-black-50 d-block mb-1 text-uppercase">
                    Total Reservations Completed
                  </small>
                  <span className="font-size-xxl mt-1">{resCompTotal}</span>
                </div>
                <div className="ml-auto">
                  <div className="bg-grow-early text-center text-white font-size-xl d-50 rounded-circle">
                    <CompletedIcon className="font-size-xl" />
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <span className="text-success px-1"> {resCompLast30Days}</span>
                <span className="text-black-50">completed this month</span>
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card className="card-box mb-4">
            <CardContent className="p-3">
              <div className="align-box-row align-items-start">
                <div className="font-weight-bold">
                  <small className="text-black-50 d-block mb-1 text-uppercase">
                    Fans Connected With
                  </small>
                  <span className="font-size-xxl mt-1">{fansTotal}</span>
                </div>
                <div className="ml-auto">
                  <div className="bg-happy-fisher text-center text-white font-size-xl d-50 rounded-circle">
                    <FontAwesomeIcon icon={["far", "user"]} />
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <span className="text-success px-1">{fansLast30Days}</span>
                <span className="text-black-50">this month</span>
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card className="card-box mb-4">
            <CardContent className="p-3">
              <div className="align-box-row align-items-start">
                <div className="font-weight-bold">
                  <small className="text-black-50 d-block mb-1 text-uppercase">
                    Time As A Host
                  </small>
                  <span className="font-size-xxl mt-1">
                    {Math.trunc(secDiff / (60 * 60 * 24))} days
                  </span>
                </div>
                <div className="ml-auto">
                  <div className="bg-plum-plate text-center text-white font-size-xl d-50 rounded-circle">
                    <FontAwesomeIcon
                      icon={["far", "clock"]}
                      className="font-size-xxl"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <span className="text-success px-1">{Math.trunc(secDiff)}</span>
                <span className="text-black-50">seconds</span>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Fragment>
  );
}

HostAnalyticsSection.propTypes = hostAnalyticsProps;

export default HostAnalyticsSection;
