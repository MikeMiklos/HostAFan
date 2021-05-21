using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Sabio.Models;
using Sabio.Models.Domain;
using Sabio.Models.Requests;
using Sabio.Models.Requests.ListingReservations;
using Sabio.Services;
using Sabio.Services.Interfaces;
using Sabio.Web.Controllers;
using Sabio.Web.Models.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sabio.Web.Api.Controllers
{
    [Route("api/reservations")]
    [ApiController]
    public class ListingReservationApiController : BaseApiController
    {
        private IListingReservationService _service = null;
        private IEmailService _emailService = null;
        private IAuthenticationService<int> _authService = null;

        public ListingReservationApiController(IListingReservationService service
            , ILogger<ListingReservationApiController> logger
            , IEmailService emailService
            , IAuthenticationService<int> authService) : base(logger)
        {
            _service = service;
            _emailService = emailService;
            _authService = authService;
        }

        [HttpGet]
        public ActionResult<ItemResponse<Paged<ListingReservationBase>>> GetAll(int pageIndex, int pageSize)
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                Paged<ListingReservationBase> page = _service.GetAll(pageIndex, pageSize);
                if (page == null)
                {
                    code = 404;
                    response = new ErrorResponse("Application resource not found.");
                }
                else
                {
                    response = new ItemResponse<Paged<ListingReservationBase>> { Item = page };
                }
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse(ex.Message);
                base.Logger.LogError(ex.ToString());
            }

            return StatusCode(code, response);

        }

        [HttpGet("{id:int}")]
        public ActionResult<ItemResponse<ListingReservation>> GetDetailsById(int id)
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                ListingReservation reservation = _service.GetDetails(id);

                if (reservation == null)
                {
                    code = 404;
                    response = new ErrorResponse("Application resource not found.");
                }
                else
                {
                    response = new ItemResponse<ListingReservation> { Item = reservation };
                }
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse(ex.Message);
                base.Logger.LogError(ex.ToString());
            }

            return StatusCode(code, response);
        }

        [HttpGet("created/{id:int}")]
        public ActionResult<ItemResponse<Paged<ListingReservation>>> GetByCreatedBy(int id, int pageIndex, int pageSize)
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                Paged<ListingReservation> page = _service.GetByCreatedBy(id, pageIndex, pageSize);

                if (page == null)
                {
                    code = 404;
                    response = new ErrorResponse("Application resource not found.");
                }
                else
                {
                    response = new ItemResponse<Paged<ListingReservation>> { Item = page };
                }
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse(ex.Message);
                base.Logger.LogError(ex.ToString());
            }

            return StatusCode(code, response);
        }

        [HttpGet("host")]
        public ActionResult<ItemsResponse<ListingReservation>> GetByHostId()
        {
            int code = 200;
            BaseResponse response = null;
            try
            {
                int hostId = _authService.GetCurrentUserId();
                List<ListingReservation> reservations = _service.GetByHostId(hostId);
                if (reservations == null)
                {
                    code = 404;
                    response = new ErrorResponse("No reservations found.");
                }
                else
                {
                    response = new ItemsResponse<ListingReservation> { Items = reservations };
                }
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse($"Reservations Error: {ex.Message}");
                base.Logger.LogError(ex.ToString());
            }
            return StatusCode(code, response);
        }

        [HttpGet("status/{statusId:int}")]
        public ActionResult<ItemsResponse<Paged<ListingReservation>>> GetByStatus(int statusId, int pageIndex, int pageSize)
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                Paged<ListingReservation> page = _service.GetByStatus(statusId, pageIndex, pageSize);

                if (page == null)
                {
                    code = 404;
                    response = new ErrorResponse("Resrvations not found.");
                }
                else
                {
                    response = new ItemResponse<Paged<ListingReservation>> { Item = page };
                }
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse(ex.Message);
                base.Logger.LogError(ex.ToString());
            }

            return StatusCode(code, response);
        }

        [HttpGet("search")]
        public ActionResult<ItemResponse<Paged<ListingReservation>>> SearchByFanHostListing(string query, int pageIndex, int pageSize)
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                Paged<ListingReservation> page = _service.SearchByFanHostListing(query, pageIndex, pageSize);

                if (page == null)
                {
                    code = 404;
                    response = new ErrorResponse("Application resource not found.");
                }
                else
                {
                    response = new ItemResponse<Paged<ListingReservation>> { Item = page };
                }
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse(ex.Message);
                base.Logger.LogError(ex.ToString());
            }

            return StatusCode(code, response);
        }

        //[HttpPost]
        //public ActionResult<ItemResponse<int>> Create(ListingReservationAddRequest model)
        //{
        //    ObjectResult result = null;
        //    try
        //    {
        //        int userId = _authService.GetCurrentUserId();
        //        int id = _service.Add(model, userId);
        //        ItemResponse<int> response = new ItemResponse<int>() { Item = id };
        //        result = Created201(response);
        //    }
        //    catch (Exception ex)
        //    {
        //        Logger.LogError(ex.ToString());
        //        ErrorResponse response = new ErrorResponse(ex.Message);
        //        result = StatusCode(500, response);
        //    }
        //    return result;
        //}
        [HttpPut("{id:int}")]
        public ActionResult<SuccessResponse> Update(ListingReservationUpdateRequest model)
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                _service.Update(model);
                response = new SuccessResponse();
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse(ex.Message);
            }

            return StatusCode(code, response);
        }

        [HttpPut("oldRes")]
        public ActionResult<ItemsResponse<ReservationCloseoutRequest>> UpdateOldReservations(List<int> reservationIdList)
        {            
            int code = 200;
            BaseResponse response = null;
            List<ReservationCloseoutRequest> resList = null;
            try
            {
                resList = _service.UpdateOldReservations(reservationIdList);
                if (resList != null)
                {
                    foreach (ReservationCloseoutRequest res in resList)
                    {
                        _emailService.SendReservationCloseoutEmail(res);
                    }
                }
                response = new ItemsResponse<ReservationCloseoutRequest> { Items = resList };
            }
            catch (Exception ex)
            {
                code = 500;
                base.Logger.LogError(ex.ToString());
                response = new ErrorResponse($"Error updating old reservations: {ex.Message}");
            }

            return StatusCode(code, response);
        }
    }
}
