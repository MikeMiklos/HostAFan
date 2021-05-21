using Sabio.Models;
using Sabio.Models.Domain;
using Sabio.Models.Requests.ParkingProfiles;
using System.Collections.Generic;

namespace Sabio.Services.Interfaces
{
    public interface IParkingProfileService
    {
        ParkingProfile GetById(int id);

        List<ParkingProfile> GetByCreatedBy(int createdById);

        Paged<ParkingProfile> GetAll(int pageIndex, int pageSize);

        int Add(ParkingProfileAddRequest model, int userId);

        void Update(ParkingProfileUpdateRequest model);

        void Delete(int id);       
    }
}
