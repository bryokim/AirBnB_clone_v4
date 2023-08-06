/* global $ */

$(document).ready(function () {
  const h4Element = $("DIV.amenities h4");

  let checkedAmenityIds = [];

  $("DIV.popover").on("change", 'INPUT[type="checkbox"]', function () {
    const amenityName = $(this).attr("data-name"),
      amenityId = $(this).attr("data-id");

    if (this.checked) {
      if (checkedAmenityIds.length > 0) {
        h4Element.text(h4Element.text() + ", " + amenityName);
      } else {
        h4Element.text(h4Element.text() + amenityName);
      }
      checkedAmenityIds.push(amenityId);
    } else {
      checkedAmenityIds = checkedAmenityIds.filter((id) => id != amenityId);

      newText = h4Element
        .text()
        .replaceAll(new RegExp(`\\b(${amenityName}(, *)?)\\b`, "g"), "");

      newText = newText.endsWith(", ")
        ? newText.substring(0, newText.length - 2)
        : newText;

      h4Element.text(newText);
    }
  });

  $.get("http://0.0.0.0:5001/api/v1/status/", function (data, status) {
    if (status === "success") {
      if (data.status === "OK") {
        $("DIV#api_status").addClass("available");
      } else {
        $("DIV#api_status").removeClass("available");
      }
    }
  });

  $.ajax({
    url: "http://0.0.0.0:5001/api/v1/places_search/",
    method: "POST",
    data: "{}",
    headers: {
      "Content-Type": "application/json",
    },
    success: function (data, status) {
      data.forEach((place) => {
        $("section.places").append(
          `<article>
          <div class="title_box">
            <h2>${place.name}</h2>
            <div class="price_by_night">$${place.price_by_night}</div>
          </div>
          <div class="information">
            <div class="max_guest">${place.max_guest} Guest</div>
            <div class="number_rooms">${place.number_rooms} Bedroom</div>
            <div class="number_bathrooms">${place.number_bathrooms} Bathroom</div>
          </div>
          <div class="description">
             ${place.description}
          </div>
        </article>`
        );
      });
    },
    error: function (jqXHR, status) {
      alert(status);
    },
  });
});
