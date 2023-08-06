/* global $ */

$(document).ready(function () {
  let checkedAmenityIds = [],
    checkedStateIds = [],
    checkedCityIds = [];

  /* Event handler for when checking or unchecking checkbox */
  function handle_checkbox(currentElement, h4Element, idArray) {
    const name = currentElement.attr("data-name"),
      id = currentElement.attr("data-id");

    if (currentElement[0].checked) {
      if (idArray.length > 0 || h4Element.text().length != 1) {
        h4Element.text(h4Element.text() + ", " + name);
      } else {
        h4Element.text(h4Element.text() + name);
      }
      idArray.push(id);
    } else {
      idArray = idArray.filter((cur_id) => cur_id != id);

      newText = h4Element
        .text()
        .replaceAll(new RegExp(`\\b(${name}(, *)?)\\b`, "g"), "");

      newText = newText.endsWith(", ")
        ? newText.substring(0, newText.length - 2)
        : newText;

      h4Element.text(newText);
    }

    return idArray;
  }

  /* Amenity checkbox */
  $("DIV.amenities").on("change", 'INPUT[type="checkbox"]', function (event) {
    checkedAmenityIds = handle_checkbox(
      $(this),
      $("DIV.amenities h4"),
      checkedAmenityIds
    );
    event.stopPropagation();
  });

  /* State checkbox */
  $("LI.state").on("change", 'INPUT[type="checkbox"]', function (event) {
    checkedStateIds = handle_checkbox(
      $(this),
      $("DIV.locations h4"),
      checkedStateIds
    );
    event.stopPropagation();
  });

  /* City checkbox */
  $("LI.city").on("change", 'INPUT[type="checkbox"]', function (event) {
    checkedCityIds = handle_checkbox(
      $(this),
      $("DIV.locations h4"),
      checkedCityIds
    );
    event.stopPropagation();
  });

  /* Get API status */
  $.get("http://0.0.0.0:5001/api/v1/status/", function (data, status) {
    if (status === "success") {
      if (data.status === "OK") {
        $("DIV#api_status").addClass("available");
      } else {
        $("DIV#api_status").removeClass("available");
      }
    }
  });

  /* Search for places and add to html dynamically */
  function search_places(data = "{}") {
    $.ajax({
      url: "http://0.0.0.0:5001/api/v1/places_search/",
      method: "POST",
      data: data,
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
  }

  /* Get all places when the page loads */
  search_places();

  /* Filter places according to the selected choices */
  $("button").on("click", function () {
    $("section.places").empty();
    search_places(
      `{"amenities": ${JSON.stringify(checkedAmenityIds)},
        "states": ${JSON.stringify(checkedStateIds)},
        "cities": ${JSON.stringify(checkedCityIds)}
      }`
    );
  });
});
