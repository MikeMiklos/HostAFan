using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

[Route("api/parking")]
[ApiController]
public class ParkingProfileApiController : BaseApiController
{
    private IParkingProfileService _service = null;
    private ILocationsService _locService = null;
    private IAuthenticationService<int> _authService = null;

    public ParkingProfileApiController(IParkingProfileService service
        , ILogger<ParkingProfileApiController> logger
        , ILocationsService locService
        , IAuthenticationService<int> authService) : base(logger)
    {
        _service = service;
        _locService = locService;
        _authService = authService;
    }

    [HttpGet]
    public ActionResult<ItemResponse<Paged<ParkingProfile>>> GetAll(int pageIndex, int pageSize)
    {
        int code = 200;
        BaseResponse response = null;

        try
        {
            Paged<ParkingProfile> pagedList = _service.GetAll(pageIndex, pageSize);

            if (pagedList == null)
            {
                code = 404;
                response = new ErrorResponse("Parking profiles not found.");
            }
            else
            {
                response = new ItemResponse<Paged<ParkingProfile>> { Item = pagedList };
            }
        }
        catch (Exception ex)
        {
            code = 500;
            base.Logger.LogError(ex.ToString());
            response = new ErrorResponse($"Parking Profile Error: {ex.Message}");
        }

        return StatusCode(code, response);
    }

    [HttpGet("{id:int}")]
    public ActionResult<ItemResponse<ParkingProfile>> GetById(int id)
    {
        int code = 200;
        BaseResponse response = null;

        try
        {
            ParkingProfile profile = _service.GetById(id);

            if (profile == null)
            {
                code = 404;
                response = new ErrorResponse("Parking profile not found");
            }
            else
            {
                response = new ItemResponse<ParkingProfile> { Item = profile };
            }
        }
        catch (Exception ex)
        {
            code = 500;
            base.Logger.LogError(ex.ToString());
            response = new ErrorResponse($"Parking profile Error: {ex.Message}");
        }

        return StatusCode(code, response);
    }

    [HttpGet("current")]
    public ActionResult<ItemsResponse<ParkingProfile>> GetByCreatedBy()
    {
        int code = 200;
        BaseResponse response = null;

        try
        {
            int userId = _authService.GetCurrentUserId();
          List<ParkingProfile> list = _service.GetByCreatedBy(userId);

            if (list == null)
            {
                code = 404;
                response = new ErrorResponse("Parking profiles not found");
            }
            else
            {
                response = new ItemsResponse<ParkingProfile> { Items = list };
            }
        }
        catch (Exception ex)
        {
            code = 500;
            base.Logger.LogError(ex.ToString());
            response = new ErrorResponse($"Parking profile Error: {ex.Message}");
        }

        return StatusCode(code, response);
    }

    [HttpPost]
    public ActionResult<ItemResponse<int>> Add(ParkingProfileAddRequest model)
    {
        ObjectResult result = null;

        try
        {
            int userId = _authService.GetCurrentUserId();
            if (model.LocationId == 0)
            {
                model.LocationId = _locService.Add(model.Location, userId);
            }
            int id = _service.Add(model, userId);
            ItemResponse<int> response = new ItemResponse<int> { Item = id };
            result = Created201(response);
        }
        catch (Exception ex)
        {
            base.Logger.LogError(ex.ToString());
            ErrorResponse response = new ErrorResponse($"Could not add parking profile: {ex.Message}");
            result = StatusCode(500, Response);
        }

        return result;
    }

    [HttpPut("{id:int}")]
    public ActionResult<SuccessResponse> Update(ParkingProfileUpdateRequest model)
    {
        int code = 200;
        BaseResponse response = null;

        try
        {
            int userId = _authService.GetCurrentUserId();
            if (model.LocationId == 0)
            {
                model.LocationId = _locService.Add(model.Location, userId);
            }
            _service.Update(model);
            response = new SuccessResponse();
        }
        catch (Exception ex)
        {
            base.Logger.LogError(ex.ToString());
            code = 500;
            response = new ErrorResponse(ex.Message);
        }

        return StatusCode(code, response);
    }

    [HttpDelete("{id:int}")]
    public ActionResult<SuccessResponse> Delete(int id)
    {
        int code = 200;
        BaseResponse response = null;

        try
        {
            _service.Delete(id);
            response = new SuccessResponse();
        }
        catch (Exception ex)
        {
            base.Logger.LogError(ex.ToString());
            code = 500;
            response = new ErrorResponse(ex.Message);
        }

        return StatusCode(code, response);
    }

}

