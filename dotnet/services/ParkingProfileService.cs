using Sabio.Data;
using Sabio.Data.Providers;
using Sabio.Models;
using Sabio.Models.Domain;
using Sabio.Models.Requests.ParkingProfiles;
using Sabio.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Text;

namespace Sabio.Services
{
    public class ParkingProfileService : IParkingProfileService
    {
        IDataProvider _data = null;
        ILocationMapper _mapLocation = null;
        IUserDetailMapper _userDetailMapper = null;

        public ParkingProfileService(IDataProvider data, ILocationMapper locationMapper, IUserDetailMapper userDetailMapper)
        {
            _data = data;
            _mapLocation = locationMapper;
            _userDetailMapper = userDetailMapper;
        }

        public Paged<ParkingProfile> GetAll(int pageIndex, int pageSize)
        {
            Paged<ParkingProfile> pagedList = null;
            List<ParkingProfile> list = null;
            int totalCount = 0;

            string procName = "[dbo].[ParkingProfiles_SelectAll]";

            _data.ExecuteCmd(procName, 
                inputParamMapper: delegate (SqlParameterCollection col)
                {
                    col.AddWithValue("@PageIndex", pageIndex);
                    col.AddWithValue("@PageSize", pageSize);
                },
                singleRecordMapper: delegate (IDataReader reader, short set)
                {
                    int index = 0;
                    ParkingProfile model = MapParkingProfile(reader, ref index);

                    if (list == null)
                    {
                        list = new List<ParkingProfile>();
                    }

                    if (totalCount == 0)
                    {
                        totalCount = reader.GetSafeInt32(index);
                    }

                    list.Add(model);
                }
            );

            if (list != null)
            {
                pagedList = new Paged<ParkingProfile>(list, pageIndex, pageSize, totalCount);
            }
            return pagedList;
        }

        public ParkingProfile GetById(int id)
        {
            ParkingProfile profile = null;
            string procName = "[dbo].[ParkingProfiles_Select_ById]";

            _data.ExecuteCmd(procName, 
                inputParamMapper: delegate (SqlParameterCollection col)
                {
                    col.AddWithValue("@Id", id);
                },
                singleRecordMapper: delegate (IDataReader reader, short set)
                {
                    int index = 0;
                    profile = MapParkingProfile(reader, ref index);
                }
            );
            
            return profile;
        }

        public List<ParkingProfile> GetByCreatedBy(int createdById)
        {

            List<ParkingProfile> list = null;
            string procName = "[dbo].[ParkingProfiles_Select_ByCreatedBy]";

            _data.ExecuteCmd(procName,
                inputParamMapper: delegate (SqlParameterCollection col)
                {
                    col.AddWithValue("@CreatedBy", createdById);

                },
                singleRecordMapper: delegate (IDataReader reader, short set)
                {
                    int index = 0;
                    ParkingProfile model = MapParkingProfile(reader, ref index);

                    if (list == null)
                    {
                        list = new List<ParkingProfile>();
                    }

                    list.Add(model);
                }
            );

            return list;
        }

        public int Add(ParkingProfileAddRequest model, int userId)
        {
            int id = 0;
            string procName = "[dbo].[ParkingProfiles_Insert]";

            _data.ExecuteNonQuery(procName,
                inputParamMapper: delegate (SqlParameterCollection col)
                {
                    AddCommonParams(model, col);
                    col.AddWithValue("@CreatedBy", userId);
                    SqlParameter idOut = new SqlParameter("@Id", SqlDbType.Int);
                    idOut.Direction = ParameterDirection.Output;

                    col.Add(idOut);
                },
                returnParameters: delegate (SqlParameterCollection returnCol)
                {
                    object oId = returnCol["@Id"].Value;

                    Int32.TryParse(oId.ToString(), out id);
                }
            );

            return id;

        }

        public void Update(ParkingProfileUpdateRequest model)
        {
            string procName = "[dbo].[ParkingProfiles_Update]";

            _data.ExecuteNonQuery(procName,
                inputParamMapper: delegate (SqlParameterCollection col)
                {
                    AddCommonParams(model, col);
                    col.AddWithValue("@Id", model.Id);
                    col.AddWithValue("@ParkingProfileStatusId", model.StatusId);
                },
                returnParameters: null
            );
        }

        public void Delete(int id)
        {
        string procName = "[dbo].[ParkingProfiles_Delete_ById]";

        _data.ExecuteNonQuery(procName,
                inputParamMapper: delegate (SqlParameterCollection col)
                {
                    col.AddWithValue("@Id", id);
                },
                returnParameters: null);
        }

        private static void AddCommonParams(ParkingProfileAddRequest model, SqlParameterCollection col)
        {
            col.AddWithValue("@LanguageId", model.LanguageId);
            col.AddWithValue("@LocationId", model.LocationId);
            col.AddWithValue("@ParkingTypeId", model.ParkingTypeId);
            col.AddWithValue("@Description", model.Description);
            col.AddWithValue("@IsPrivate", model.IsPrivate);
        }

        private ParkingProfile MapParkingProfile(IDataReader reader, ref int index)
        {
            ParkingProfile profile = new ParkingProfile();
            profile.Id = reader.GetSafeInt32(index++);
            profile.Language = new LookUp3Col();
            profile.Language.Id = reader.GetSafeInt32(index++);
            profile.Language.Code = reader.GetSafeString(index++);
            profile.Language.Name = reader.GetSafeString(index++);
            profile.Location = _mapLocation.MapLocation(reader, ref index);
            profile.ParkingType = new LookUp();
            profile.ParkingType.Id = reader.GetSafeInt32(index++);
            profile.ParkingType.Name = reader.GetSafeString(index++);
            profile.Description = reader.GetSafeString(index++);
            profile.IsPrivate = reader.GetSafeBool(index++);
            profile.Status = new LookUp();
            profile.Status.Id = reader.GetSafeInt32(index++);
            profile.Status.Name = reader.GetSafeString(index++);
            profile.CreatedBy = _userDetailMapper.MapUserDetail(reader, ref index);
            profile.DateCreated = reader.GetSafeUtcDateTime(index++);
            profile.DateModified = reader.GetSafeUtcDateTime(index++);

            return profile;
        }
    }
}
