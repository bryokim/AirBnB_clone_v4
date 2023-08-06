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
});
