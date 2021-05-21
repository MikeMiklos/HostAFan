using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

public class ListingAddRequest
{
    public List<string> Amenities { get; set; }

    [Required]
    [Range (1, Int32.MaxValue)]
    public int ServiceTypeId { get; set; }

    [Required]
    [Range(0, Int32.MaxValue)]
    public int ServiceProfileId { get; set; }

    [Required]
    [Range(1, Int32.MaxValue)]
    public int EventId { get; set; }

    public string InternalName { get; set; }

    [Required]
    [StringLength(50, MinimumLength = 2)]
    public string Title { get; set; }

    [Required]
    [StringLength(150, MinimumLength = 10)]
    public string ShortDescription { get; set; }

    public string Description { get; set; }

    [Required]
    public bool IsActive { get; set; }

    [Required]
    public bool AdditionalServices { get; set; }

    public int RideshareId { get; set; }

    public int RideshareCost { get; set; }

    public DateTime? AvailabilityStart { get; set; }

    public DateTime? AvailabilityEnd { get; set; }

    public int CostPerNight { get; set; }

    public DateTime? HostEventStartTime { get; set; }

    public DateTime? HostEventEndTime { get; set; }

    public int HostEventMaxCapacity { get; set; }
}

