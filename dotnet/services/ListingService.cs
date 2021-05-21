using Sabio.Data;
using Sabio.Data.Providers;
using Sabio.Models;
using Sabio.Models.Domain;
using Sabio.Models.Enums;
using Sabio.Models.Requests;
using Sabio.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Dynamic;
using System.Reflection;
using System.Text;

namespace Sabio.Services
{
    public class ListingService : IListingService, IListingMapper
    {
        IDataProvider _data = null;
        IUserDetailMapper _userDetailMapper = null;
        ILocationMapper _mapLocation = null;
        IVenueMapper _mapVenue = null;
        IEventMapper _mapEvent = null;

        public ListingService(IDataProvider data, IUserDetailMapper userDetailMapper, ILocationMapper locationMapper, IVenueMapper mapVenue,
                                IEventMapper mapEvent)
        {
            _data = data;
            _userDetailMapper = userDetailMapper;
            _mapLocation = locationMapper;
            _mapVenue= mapVenue;
            _mapEvent = mapEvent;
        }
        
        public ExpandoObject Get(int id)
        {
            string procName = "[dbo].[Listings_SelectDetails_ById_V4]";
            dynamic resultObj = null; 

            _data.ExecuteCmd(procName, delegate (SqlParameterCollection parameterCollection)
            {
                parameterCollection.AddWithValue("@Id", id);
            }, delegate (IDataReader reader, short set)
            {
                int idx = 0;
                resultObj = new ExpandoObject();
                resultObj.listing = MapListing(reader, ref idx);
            });

            return resultObj;
        }

        public Paged<Listing> GetAll(int pageIndex, int pageSize)
        { 
            Paged<Listing> pagedResult = null;
            List<Listing> listings = null;
            int totalCount = 0;
            string procName = "[dbo].[Listings_SelectDetails_V4]";

            _data.ExecuteCmd(procName, inputParamMapper: delegate (SqlParameterCollection parameterCollection)
            {
                parameterCollection.AddWithValue("@PageIndex", pageIndex);
                parameterCollection.AddWithValue("@PageSize", pageSize);
            }, singleRecordMapper: delegate (IDataReader reader, short set)
            {
                int idx = 0;
                Listing listing = MapListing(reader, ref idx);
                if (totalCount == 0)
                {
                    totalCount = reader.GetSafeInt32(idx);
                }
                if (listings == null)
                {
                    listings = new List<Listing>();
                }
                listings.Add(listing);
            }
            );
            if (listings != null)
            {
                pagedResult = new Paged<Listing>(listings, pageIndex, pageSize, totalCount);
            }
            return pagedResult;
        }

        public Paged<Listing> Search(int pageIndex, int pageSize, string query)
        {
            Paged<Listing> pagedResult = null;
            List<Listing> listings = null;
            int totalCount = 0;
            string procName = "[dbo].[Listings_Search_V4]";

            _data.ExecuteCmd(procName, inputParamMapper: delegate (SqlParameterCollection parameterCollection)
            {
                parameterCollection.AddWithValue("@PageIndex", pageIndex);
                parameterCollection.AddWithValue("@PageSize", pageSize);
                parameterCollection.AddWithValue("@SearchQuery", query);
            }, singleRecordMapper: delegate (IDataReader reader, short set)
            {
                int idx = 0;
                Listing listing = MapListing(reader, ref idx);
                if (totalCount == 0)
                {
                    totalCount = reader.GetSafeInt32(idx);
                }
                if (listings == null)
                {
                    listings = new List<Listing>();
                }
                listings.Add(listing);
            }
            );
            if (listings != null)
            {
                pagedResult = new Paged<Listing>(listings, pageIndex, pageSize, totalCount);
            }
            return pagedResult;
        }

        public Paged<Listing> SearchByLocation(int pageIndex, int pageSize, double lat, double lng, int radius)
        {
            Paged<Listing> pagedResult = null;
            List<Listing> listings = null;
            int totalCount = 0;
            string procName = "[dbo].[Listings_SearchByLocation_V4]";

            _data.ExecuteCmd(procName, inputParamMapper: delegate (SqlParameterCollection parameterCollection)
            {
                parameterCollection.AddWithValue("@PageIndex", pageIndex);
                parameterCollection.AddWithValue("@PageSize", pageSize);
                parameterCollection.AddWithValue("@Lat", lat);
                parameterCollection.AddWithValue("@Lng", lng);
                parameterCollection.AddWithValue("@Radius", radius);
            }, singleRecordMapper: delegate (IDataReader reader, short set)
            {
                int idx = 0;
                Listing listing = MapListingWithLocation(reader, ref idx);
                if (totalCount == 0)
                {
                    totalCount = reader.GetSafeInt32(idx);
                }
                if (listings == null)
                {
                    listings = new List<Listing>();
                }
                listings.Add(listing);
            }
            );
            if (listings != null)
            {
                pagedResult = new Paged<Listing>(listings, pageIndex, pageSize, totalCount);
            }
            return pagedResult;
        }
        
        public List<Listing> GetByCreatedBy(int createdById)
        {

            List<Listing> list = null;
            string procName = "[dbo].[Listings_SelectByCreatedBy_V4]";

            _data.ExecuteCmd(procName,
                inputParamMapper: delegate (SqlParameterCollection col)
                {
                    col.AddWithValue("@UserId", createdById);

                },
                singleRecordMapper: delegate (IDataReader reader, short set)
                {
                    int index = 0;
                    Listing listing = MapListing(reader, ref index);

                    if (list == null)
                    {
                        list = new List<Listing>();
                    }
                    list.Add(listing);
                }
            );
            return list;
        }

        public int Add(ListingAddRequest model, int userId)
        {
            int id = 0;
            string procName = "dbo.Listings_Insert_V4";
            DataTable paramValue = null;

            if (model.Amenities != null)
            {
                paramValue = MapAmenitiesToTable(model.Amenities);
            }

            _data.ExecuteNonQuery(procName,
                inputParamMapper: delegate (SqlParameterCollection col)
                {
                    col.AddWithValue("@CreatedBy", userId);
                    col.AddWithValue("@batchAmenities", paramValue);
                    AddCommonParams(model, col);

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

        public void Update(ListingUpdateRequest model)
        {
            string procName = "dbo.Listings_Update_V3";
            DataTable paramValue = null;

            if (model.Amenities != null)
            {
                paramValue = MapAmenitiesToTable(model.Amenities);
            }

            _data.ExecuteNonQuery(procName,
                inputParamMapper: delegate (SqlParameterCollection col)
                {
                    col.AddWithValue("@Id", model.Id);
                    col.AddWithValue("@batchAmenities", paramValue);

                    AddCommonParams(model, col);
                },
                returnParameters: null);
        }

        public void Delete(int id)
        {
            string procName = "[dbo].[Listings_Update_Delete_V2]";

            _data.ExecuteNonQuery(procName,
                inputParamMapper: delegate (SqlParameterCollection col)
            {
                col.AddWithValue("@Id", id);
            },
            returnParameters: null);
        }
        
        private static void AddCommonParams(ListingAddRequest model, SqlParameterCollection col)
        {
            col.AddWithValue("@ServiceTypeId", model.ServiceTypeId);
            col.AddWithValue("@ServiceProfileId", model.ServiceProfileId);
            col.AddWithValue("@EventId", model.EventId);
            col.AddWithValue("@InternalName", model.InternalName);
            col.AddWithValue("@Title", model.Title);
            col.AddWithValue("@ShortDescription", model.ShortDescription);
            col.AddWithValue("@Description", model.Description);
            col.AddWithValue("@IsActive", model.IsActive);
            col.AddWithValue("@AdditionalServices", model.AdditionalServices);
            col.AddWithValue("@RideshareId", model.RideshareId);
            col.AddWithValue("@RideshareCost", model.RideshareCost);
            col.AddWithValue("@AvailabilityStart", model.AvailabilityStart);
            col.AddWithValue("@AvailabilityEnd", model.AvailabilityEnd);
            col.AddWithValue("@CostPerNight", model.CostPerNight);
            col.AddWithValue("@HostEventStart", model.HostEventStartTime);
            col.AddWithValue("@HostEventEnd", model.HostEventEndTime);
            col.AddWithValue("@HostEventMaxCapacity", model.HostEventMaxCapacity);
        }

        public Listing MapListing(IDataReader reader, ref int idx)
        {
            Listing listing = new Listing();

            listing.Id = reader.GetSafeInt32(idx++);
            listing.ServiceType = new LookUp();
            listing.ServiceType.Id = reader.GetSafeInt32(idx++);
            listing.ServiceType.Name = reader.GetSafeString(idx++);
            listing.ServiceProfileId = reader.GetSafeInt32(idx++);
            listing.InternalName = reader.GetSafeString(idx++);
            listing.Title = reader.GetSafeString(idx++);
            listing.ShortDescription = reader.GetSafeString(idx++);
            listing.Description = reader.GetSafeString(idx++);
            listing.IsActive = reader.GetSafeBool(idx++);
            listing.HasReservation = reader.GetSafeBool(idx++);
            listing.AvailabilityStart = reader.GetSafeDateTime(idx++);
            listing.AvailabilityEnd = reader.GetSafeDateTime(idx++);
            listing.CostPerNight= reader.GetSafeInt32(idx++);
            listing.CreatedBy = _userDetailMapper.MapUserDetail(reader, ref idx);
            listing.DateCreated = reader.GetSafeDateTime(idx++);
            listing.DateModified = reader.GetSafeDateTime(idx++);
            listing.Event = _mapEvent.MapEvent(reader, ref idx);
            listing.Images = reader.DeserializeObject<List<File>>(idx++);
           
            switch (listing.ServiceType.Id)
            {
                case (int)ListingType.Stay:
                    HostProfile hostProfile = new HostProfile();
                    listing.ListingProfile = ConvertToExpando(hostProfile);
                    listing.ListingProfile = reader.DeserializeObject<ExpandoObject>(idx++);
                    break;
                case (int)ListingType.RideShare:
                    RideShareProfile rideShareProfile = new RideShareProfile();
                    listing.ListingProfile = ConvertToExpando(rideShareProfile);
                    listing.ListingProfile = reader.DeserializeObject<ExpandoObject>(idx++);
                    break;                
                case (int)ListingType.Parking:
                    ParkingProfile parkingProfile = new ParkingProfile();
                    listing.ListingProfile = ConvertToExpando(parkingProfile);
                    listing.ListingProfile = reader.DeserializeObject<ExpandoObject>(idx++);
                    break;
                case (int)ListingType.HostedEvent:
                    EventManagementProfile eventManagementProfile = new EventManagementProfile();
                    listing.ListingProfile = ConvertToExpando(eventManagementProfile);
                    listing.ListingProfile = reader.DeserializeObject<ExpandoObject>(idx++);
                    break;
            }
                
            listing.AdditionalServices = reader.GetSafeBool(idx++);

                if (listing.AdditionalServices.Equals(true))
                {
                    listing.Services = reader.DeserializeObject<List<AdditionalService>>(idx++);
                }
                else
                {
                    idx++;
                }

            int hasAmenities = reader.GetSafeInt32(idx++);
            
                if (hasAmenities > 0)
                {
                    listing.Amenities = reader.DeserializeObject<List<Amenity>>(idx++);
                } else
                {
                    idx++;
                }
            
            return listing;
        }

        private Listing MapListingWithLocation(IDataReader reader, ref int idx)
        {
            Listing listing = new Listing();

            listing.Id = reader.GetSafeInt32(idx++);
            listing.ServiceType = new LookUp();
            listing.ServiceType.Id = reader.GetSafeInt32(idx++);
            listing.ServiceType.Name = reader.GetSafeString(idx++);
            listing.ServiceProfileId = reader.GetSafeInt32(idx++);
            listing.InternalName = reader.GetSafeString(idx++);
            listing.Title = reader.GetSafeString(idx++);
            listing.ShortDescription = reader.GetSafeString(idx++);
            listing.Description = reader.GetSafeString(idx++);
            listing.IsActive = reader.GetSafeBool(idx++);
            listing.HasReservation = reader.GetSafeBool(idx++);
            listing.AvailabilityStart = reader.GetSafeDateTime(idx++);
            listing.AvailabilityEnd = reader.GetSafeDateTime(idx++);
            listing.CostPerNight = reader.GetSafeInt32(idx++);
            listing.CreatedBy = _userDetailMapper.MapUserDetail(reader, ref idx);
            listing.DateCreated = reader.GetSafeDateTime(idx++);
            listing.DateModified = reader.GetSafeDateTime(idx++);
            listing.Event = _mapEvent.MapEvent(reader, ref idx);
            listing.Images = reader.DeserializeObject<List<File>>(idx++);
            listing.Location = _mapLocation.MapLocation(reader, ref idx);

            switch (listing.ServiceType.Id)
            {
                case (int)ListingType.Stay:
                    HostProfile hostProfile = new HostProfile();
                    listing.ListingProfile = ConvertToExpando(hostProfile);
                    listing.ListingProfile = reader.DeserializeObject<ExpandoObject>(idx++);
                    break;
                case (int)ListingType.RideShare:
                    RideShareProfile rideShareProfile = new RideShareProfile();
                    listing.ListingProfile = ConvertToExpando(rideShareProfile);
                    listing.ListingProfile = reader.DeserializeObject<ExpandoObject>(idx++);
                    break;
                case (int)ListingType.Parking:
                    ParkingProfile parkingProfile = new ParkingProfile();
                    listing.ListingProfile = ConvertToExpando(parkingProfile);
                    listing.ListingProfile = reader.DeserializeObject<ExpandoObject>(idx++);
                    break;
                case (int)ListingType.HostedEvent:
                    EventManagementProfile eventManagementProfile = new EventManagementProfile();
                    listing.ListingProfile = ConvertToExpando(eventManagementProfile);
                    listing.ListingProfile = reader.DeserializeObject<ExpandoObject>(idx++);
                    break;
            }

            listing.AdditionalServices = reader.GetSafeBool(idx++);
            if (listing.AdditionalServices.Equals(true))
            {
                listing.Services = reader.DeserializeObject<List<AdditionalService>>(idx++);
            }
            else
            {
                idx++;
            }

            int hasAmenities = reader.GetSafeInt32(idx++);
            if (hasAmenities > 0)
            {
                listing.Amenities = reader.DeserializeObject<List<Amenity>>(idx++);
            }
            else
            {
                idx++;
            }
            return listing;
        }

        private static ExpandoObject ConvertToExpando(object obj)
        {
            ExpandoObject result = new ExpandoObject();

            PropertyInfo[] properties = obj.GetType().GetProperties();

            foreach (PropertyInfo property in properties)
            {
                result.TryAdd(property.Name, null);
            }
            
            return result;
        }

        private DataTable MapAmenitiesToTable(List<string> amenitiesToMap)
        {
            DataTable dt = new DataTable();
            dt.Columns.Add("Name", typeof(string));

            foreach (string singleAmenity in amenitiesToMap)
            {
                DataRow dr = dt.NewRow();
                int idx = 0;
                dr.SetField(idx++, singleAmenity);
                dt.Rows.Add(dr);
            }

            return dt;
        }

    }
}
