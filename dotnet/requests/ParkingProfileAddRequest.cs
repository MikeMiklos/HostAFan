using System;
using System.Collections.Generic;
using System.Text;
using System.ComponentModel.DataAnnotations;

    public class ParkingProfileAddRequest
    {
        [Required, Range(1, Int32.MaxValue)]
        public int LanguageId { get; set; }
        
        public int LocationId { get; set; }
        
        public LocationAddRequest Location { get; set; }
        
        [Required, Range(1, Int32.MaxValue)]
        public int ParkingTypeId { get; set; }
        
        public string Description { get; set; }
        
        [Required]
        public bool IsPrivate { get; set; }
    }

