using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Text;
using System.Data;

public class LocationsService : ILocationsService, ILocationMapper
{
    IDataProvider _data = null;


    public LocationsService(IDataProvider data)
    {
        _data = data;

    }

    public Location GetById(int id)
    {
        string procName = "[dbo].[Locations_Select_ById_V2]";

        Location location = null;

        _data.ExecuteCmd(procName, 
            delegate (SqlParameterCollection parameterCollection)
            {
                parameterCollection.AddWithValue("@Id", id);
            },
            delegate (IDataReader reader, short set)
            {
                int index = 0;
                location = MapLocation(reader, ref index);
            }
        );

        return location;
    }

    public List<Location> GetByCreatedBy(int userId)
    {
        string procName = "[dbo].[Locations_Select_ByCreatedBy_V2]";

        List<Location> list = null;

        _data.ExecuteCmd(procName,
            delegate (SqlParameterCollection parameterCollection)
            {
                parameterCollection.AddWithValue("@CreatedBy", userId);
            },
            delegate (IDataReader reader, short set)
            {
                int index = 0;
                Location aLocation = MapLocation(reader, ref index);

                if (list == null)
                {
                    list = new List<Location>();
                }

                list.Add(aLocation);
            }
        );
        return list;
    }

    public int Add(LocationAddRequest model, int userId)
    {
        int id = 0;

        string procName = "[dbo].[Locations_Insert_V2]";

        _data.ExecuteNonQuery(procName
            , inputParamMapper: delegate (SqlParameterCollection col)
            {
                AddCommonParams(model, col, userId);
                col.AddWithValue("@CreatedBy", userId);

                SqlParameter idOut = new SqlParameter("@Id", SqlDbType.Int);
                idOut.Direction = ParameterDirection.Output;

                col.Add(idOut);
            }
            , returnParameters: delegate (SqlParameterCollection returnCol)
            {
                object oId = returnCol["@Id"].Value;

                Int32.TryParse(oId.ToString(), out id);
            }
        );
        return id;
    }

    public void Update(LocationUpdateRequest model, int userId)
    {
        string procName = "[dbo].[Locations_Update]";

        _data.ExecuteNonQuery(procName
            , inputParamMapper: delegate (SqlParameterCollection col)
            {
                AddCommonParams(model, col, userId);
                col.AddWithValue("@Id", model.Id);
            }
            , returnParameters: null);
    }

    public void Delete(int id)
    {
        string procName = "[dbo].[Locations_Delete_ById]";

        _data.ExecuteNonQuery(procName
            , inputParamMapper: delegate (SqlParameterCollection col)
            {
                col.AddWithValue("@Id", id);
            }
            , returnParameters: null);
    }

    private static void AddCommonParams(LocationAddRequest model, SqlParameterCollection col, int userId)
    {
        col.AddWithValue("@LocationTypeId", model.LocationTypeId);
        col.AddWithValue("@LineOne", model.LineOne);
        col.AddWithValue("@LineTwo", model.LineTwo);
        col.AddWithValue("@City", model.City);
        col.AddWithValue("@Zip", model.Zip);
        col.AddWithValue("@StateId", model.StateId);
        col.AddWithValue("@Latitude", model.Latitude);
        col.AddWithValue("@Longitude", model.Longitude);
        col.AddWithValue("@ModifiedBy", userId);
    }

    public Location MapLocation(IDataReader reader, ref int index)
    {
        Location aLocation = new Location();

        aLocation.Id = reader.GetSafeInt32(index++);
        aLocation.LineOne = reader.GetSafeString(index++);
        aLocation.LineTwo = reader.GetSafeString(index++);
        aLocation.City = reader.GetSafeString(index++);
        aLocation.Zip = reader.GetSafeString(index++);
        aLocation.Latitude = reader.GetSafeDouble(index++);
        aLocation.Longitude = reader.GetSafeDouble(index++);
        aLocation.LocationType = new LookUp();
        aLocation.LocationType.Id = reader.GetSafeInt32(index++);
        aLocation.LocationType.Name = reader.GetSafeString(index++);
        aLocation.State = new LookUp3Col(); 
        aLocation.State.Id = reader.GetSafeInt32(index++);
        aLocation.State.Code = reader.GetSafeString(index++);
        aLocation.State.Name = reader.GetSafeString(index++);

        return aLocation;
    }
}
