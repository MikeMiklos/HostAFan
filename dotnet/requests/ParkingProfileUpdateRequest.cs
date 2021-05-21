using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

public class ParkingProfileUpdateRequest : ParkingProfileAddRequest, IModelIdentifier 
{
    [Required, Range(1, Int32.MaxValue)]
    public int Id { get; set; }

    [Required, Range(1, 10)]
    public int StatusId { get; set; }
}

