using Sabio.Data;
using Sabio.Data.Providers;
using Sabio.Models;
using Sabio.Models.Domain;
using Sabio.Models.Requests;
using Sabio.Models.Requests.ListingReservations;
using Sabio.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Text;

namespace Sabio.Services
{
    public class ListingReservationService : IListingReservationService
    {
        IDataProvider _data = null;
        IListingMapper _listingMapper = null;
        public ListingReservationService(IDataProvider data, IListingMapper listingMapper)
        {
            _data = data;
            _listingMapper = listingMapper;
        }
        public int Add(TransactionAddRequest model, int paymentTransactionId)
        {
            int id = 0;
            string procName = "[dbo].[ListingReservations_Insert_V2]";
            _data.ExecuteNonQuery(procName,
                inputParamMapper: delegate (SqlParameterCollection col)
                {
                    MapReservationParamCol(model, col);
                    col.AddWithValue("@PaymentTransactionId", paymentTransactionId);
                    SqlParameter idOut = new SqlParameter("@Id", SqlDbType.Int);
                    idOut.Direction = ParameterDirection.Output;
                    col.Add(idOut);
                },
                returnParameters: delegate (SqlParameterCollection returnCol)
                {
                    object oId = returnCol["@Id"].Value;
                    Int32.TryParse(oId.ToString(), out id);
                });
            return id;
        }
        
        public void Update(ListingReservationUpdateRequest model)
        {
            string procName = "[dbo].[ListingReservations_Update]";

            _data.ExecuteNonQuery(procName,
                inputParamMapper: delegate (SqlParameterCollection col)
                {
                    col.AddWithValue("@ListingId", model.ListingId);
                    col.AddWithValue("@DateCheckIn", model.DateCheckIn);
                    col.AddWithValue("@DateCheckOut", model.DateCheckOut);
                    col.AddWithValue("@PaymentTransactionId", model.PaymentTransactionId);
                    col.AddWithValue("@StatusId", model.StatusId);
                    col.AddWithValue("@Id", model.Id);
                },
                returnParameters: null);
        }

        public List<ReservationCloseoutRequest> UpdateOldReservations(List<int> reservationIdList)
        {
            List<ReservationCloseoutRequest> resList = null;
            DataTable reservationIdTable = null;

            if (reservationIdList.Count != 0)
            {
                reservationIdTable = MapReservationIdsToTable(reservationIdList);
            }

            string procName = "[dbo].[ListingReservations_Update_OldToInactive_V4]";
            _data.ExecuteCmd(procName, 
            inputParamMapper: delegate (SqlParameterCollection col)
            {
                col.AddWithValue("@ReservationArray", reservationIdTable);
            },
            singleRecordMapper: delegate (IDataReader reader, short set)
            {
                int idx = 0;
                ReservationCloseoutRequest request = MapResEmailData(reader, ref idx);
                if (resList == null)
                {
                    resList = new List<ReservationCloseoutRequest>();
                }
                resList.Add(request);
            });

            return resList;
        }

        public ListingReservation Get(int id)
        {
            ListingReservation reservation = new ListingReservation();

            string procName = "[dbo].[ListingReservations_SelectById_V2]";

            _data.ExecuteCmd(procName, delegate (SqlParameterCollection parameterCollection)
            {
                parameterCollection.AddWithValue("@Id", id);
            }, delegate (IDataReader reader, short set)
            {
                int index = 0;
                reservation = MapReservation(reader, ref index);

            });

            return reservation;
        }

        public ListingReservation GetDetails(int id)
        {
            ListingReservation reservation = new ListingReservation();

            string procName = "[dbo].[ListingReservations_SelectDetailsById_V2]";

            _data.ExecuteCmd(procName, delegate (SqlParameterCollection parameterCollection)
            {
                parameterCollection.AddWithValue("@Id", id);
            }, delegate (IDataReader reader, short set)
            {
                int index = 0;
                reservation = MapReservationWithListing(reader, ref index);

            });

            return reservation;
        }

        public Paged<ListingReservationBase> GetAll(int pageIndex, int pageSize)
        {
            Paged<ListingReservationBase> pagedResult = null;
            List<ListingReservationBase> reservations = null;
            int totalCount = 0;
            string procName = "[dbo].[ListingReservations_SelectAll_V3]";

            _data.ExecuteCmd(procName, delegate (SqlParameterCollection parameterCollection)
            {
                parameterCollection.AddWithValue("@PageIndex", pageIndex);
                parameterCollection.AddWithValue("@PageSize", pageSize);
            }, singleRecordMapper: delegate (IDataReader reader, short set)
            {
                int index = 0;
                ListingReservationBase reservation = MapReservation(reader, ref index);
                if (totalCount == 0)
                {
                    totalCount = reader.GetSafeInt32(index);
                }
                if (reservations == null)
                {
                    reservations = new List<ListingReservationBase>();
                }
                reservations.Add(reservation);
            });
            if (reservations != null)
            {
                pagedResult = new Paged<ListingReservationBase>(reservations, pageIndex, pageSize, totalCount);
            }
            return pagedResult;
        }

        public Paged<ListingReservation> GetByCreatedBy(int id, int pageIndex, int pageSize)
        {
            Paged<ListingReservation> pagedResult = null;
            List<ListingReservation> reservations = null;
            int totalCount = 0;
            string procName = "[dbo].[ListingReservations_Select_ByCreatedBy_V5]";
            _data.ExecuteCmd(procName, inputParamMapper: delegate (SqlParameterCollection parameterCollection)
            {
                parameterCollection.AddWithValue("@CreatedBy", id);
                parameterCollection.AddWithValue("@PageIndex", pageIndex);
                parameterCollection.AddWithValue("@PageSize", pageSize);
            }, singleRecordMapper: delegate (IDataReader reader, short set)
            {
                int index = 0;
                ListingReservation reservation = MapReservationWithListing(reader, ref index);
                if (totalCount == 0)
                {
                    totalCount = reader.GetSafeInt32(index);
                }
                if (reservations == null)
                {
                    reservations = new List<ListingReservation>();
                }
                reservations.Add(reservation);
            });
            if (reservations != null)
            {
                pagedResult = new Paged<ListingReservation>(reservations, pageIndex, pageSize, totalCount);
            }
            return pagedResult;
        }

        public Paged<ListingReservation> SearchByFanHostListing(string query, int pageIndex, int pageSize)
        {
            Paged<ListingReservation> pagedResult = null;
            List<ListingReservation> reservations = null;
            int totalCount = 0;
            string procName = "[dbo].[ListingReservations_Search_ByFanHostListing_V2]";
            _data.ExecuteCmd(procName, inputParamMapper: delegate (SqlParameterCollection parameterCollection)
            {
                parameterCollection.AddWithValue("@Query", query);
                parameterCollection.AddWithValue("@PageIndex", pageIndex);
                parameterCollection.AddWithValue("@PageSize", pageSize);
            }, singleRecordMapper: delegate (IDataReader reader, short set)
            {
                int index = 0;
                ListingReservation reservation = MapReservationWithListing(reader, ref index);
                if (totalCount == 0)
                {
                    totalCount = reader.GetSafeInt32(index);
                }
                if (reservations == null)
                {
                    reservations = new List<ListingReservation>();
                }
                reservations.Add(reservation);
            });
            if (reservations != null)
            {
                pagedResult = new Paged<ListingReservation>(reservations, pageIndex, pageSize, totalCount);
            }
            return pagedResult;
        }

        public Paged<ListingReservation> GetByStatus(int statusId, int pageIndex, int pageSize)
        {
            Paged<ListingReservation> pagedResult = null;
            List<ListingReservation> reservations = null;
            int totalCount = 0;
            string procName = "[dbo].[ListingReservations_Select_ByStatus_V2]";
            _data.ExecuteCmd(procName, inputParamMapper: delegate (SqlParameterCollection parameterCollection)
            {
                parameterCollection.AddWithValue("@StatusId", statusId);
                parameterCollection.AddWithValue("@PageIndex", pageIndex);
                parameterCollection.AddWithValue("@PageSize", pageSize);
            }, singleRecordMapper: delegate (IDataReader reader, short set)
            {
                int index = 0;
                ListingReservation reservation = MapReservationWithListing(reader, ref index);
                if (totalCount == 0)
                {
                    totalCount = reader.GetSafeInt32(index);
                }
                if (reservations == null)
                {
                    reservations = new List<ListingReservation>();
                }
                reservations.Add(reservation);
            });
            if (reservations != null)
            {
                pagedResult = new Paged<ListingReservation>(reservations, pageIndex, pageSize, totalCount);
            }
            return pagedResult;
        }

        public List<ListingReservation> GetByHostId(int hostId)
        {
            List<ListingReservation> reservations = null;
            string procName = "[dbo].[ListingReservations_Select_ByHostId_V4]";
            _data.ExecuteCmd(procName, inputParamMapper: delegate (SqlParameterCollection parameterCollection)
            {
                parameterCollection.AddWithValue("@HostId", hostId);

            }, singleRecordMapper: delegate (IDataReader reader, short set)
            {
                int index = 0;
                ListingReservation reservation = MapReservationWithListing(reader, ref index);
                
                if (reservations == null)
                {
                    reservations = new List<ListingReservation>();
                }
                reservations.Add(reservation);
            });

            return reservations;
        }

        public static ListingReservation MapReservation(IDataReader reader, ref int index)
        {
            ListingReservation reservation = new ListingReservation();

            reservation.Id = reader.GetSafeInt32(index++);
            reservation.ListingId = reader.GetSafeInt32(index++);
            reservation.DateCheckIn = reader.GetSafeDateTime(index++);
            reservation.DateCheckOut = reader.GetSafeDateTime(index++);
            reservation.PaymentTransactionId = reader.GetSafeInt32(index++);
            reservation.StatusId = reader.GetSafeInt32(index++);
            reservation.CreatedBy = reader.DeserializeObject<UserDetail>(index++);
            reservation.DateCreated = reader.GetSafeDateTime(index++);
            reservation.DateModified = reader.GetSafeDateTime(index++);

            return reservation;
        }

        private ListingReservation MapReservationWithListing(IDataReader reader, ref int index)
        {
            ListingReservation reservation = MapReservation(reader, ref index);
            reservation.Listing = _listingMapper.MapListing(reader, ref index);
            return reservation;
        }

        public static ReservationCloseoutRequest MapResEmailData(IDataReader reader, ref int index)
        {
            ReservationCloseoutRequest model = new ReservationCloseoutRequest();

            model.ReservationId = reader.GetSafeInt32(index++);
            model.CheckInDate = reader.GetSafeDateTime(index++);
            model.CheckOutDate = reader.GetSafeDateTime(index++);
            model.FanFirstName = reader.GetSafeString(index++);
            model.FanLastName = reader.GetSafeString(index++);
            model.FanEmail = reader.GetSafeString(index++);
            model.HostFirstName = reader.GetSafeString(index++);
            model.HostLastName = reader.GetSafeString(index++);
            model.HostEmail = reader.GetSafeString(index++);
            model.ListingId = reader.GetSafeInt32(index++);
            model.ListingTitle = reader.GetSafeString(index++);
            model.EventName = reader.GetSafeString(index++);
            model.EventCity = reader.GetSafeString(index++);
            model.EventState = reader.GetSafeString(index++);
            return model;
        }

        private static void MapReservationParamCol(TransactionAddRequest model, SqlParameterCollection col)
        {
            col.AddWithValue("@ListingId", model.ListingId);
            col.AddWithValue("@DateCheckIn", model.DateCheckIn);
            col.AddWithValue("@DateCheckOut", model.DateCheckOut);
            col.AddWithValue("@CreatedBy", model.SenderId);
        }

        private DataTable MapReservationIdsToTable(List<int> resIdsToMap)
        {
            DataTable dt = new DataTable();
            dt.Columns.Add("Id", typeof(int));

            foreach (int resId in resIdsToMap)
            {
                DataRow dr = dt.NewRow();
                int idx = 0;
                dr.SetField(idx++, resId);
                dt.Rows.Add(dr);
            }
            return dt;
        }
    }
}
