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
              <div class="reviews">
                <h2><span class="${place.id}"></span>Reviews<span class="show" data-place-id="${place.id}">show</span></h2>
                <ul class="reviews-list"  data-place-id="${place.id}"><ul>
              </div>
            </article>`
          );
        });
      },
      error: function (jqXHR, status) {
        alert(status);
      },
    }).done(function () {
      $("H2 SPAN").on("click", function (event) {
        spanElement = $(this);
        placeId = $(this).attr("data-place-id");

        if ($(this).attr("class") == "show") {
          $.ajax({
            url: `http://0.0.0.0:5001/api/v1/places/${placeId}/reviews`,
            success: function (data) {
              data.forEach((review) => {
                $.get(
                  `http://0.0.0.0:5001/api/v1/users/${review.user_id}`
                ).done(function (response) {
                  date = new Date(review.created_at).toLocaleDateString(
                    "en-UK",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  );
                  $(`UL[data-place-id=${placeId}]`).append(
                    `<li class="review-item">
                        <h3>From ${response.first_name || ""} ${
                      response.last_name || ""
                    } the ${date}
                        </h3>
                        <p>${review.text}</p>
                      </li>`
                  );
                });
              });
              if (data.length === 0) {
                $(`UL[data-place-id=${placeId}]`).append(
                  "<li><h3>No reviews</h3></li>"
                );
                $(`SPAN.${placeId}`).text("0 ");
              } else {
                $(`SPAN.${placeId}`).text(data.length + " ");
              }
              spanElement.toggleClass("show hide");
              spanElement.text("hide");
            },
          });
        } else {
          $(`UL[data-place-id=${placeId}]`).empty();
          spanElement.toggleClass("show hide");
          spanElement.text("show");
          $(`SPAN.${placeId}`).text("");
        }
        event.stopPropagation();
      });
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

  $("SPAN.show").on("click", function (event) {
    console.log("nothing");
    $.ajax({
      url: `http://0.0.0.0:5001/api/v1/places/${$(this).attr(
        "data-id"
      )}/reviews`,
      success: function (data) {
        data.forEach((review) => {
          $("UL.reviews-list").append(
            `<li>
              ${review.text}
            </li>
            `
          );
        });
      },
    });
  });
});
