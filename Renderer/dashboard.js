document.getElementById("employeeDropdown").addEventListener("click", function() {
    var dropdownContent = document.getElementById("employeeDropdownContent");
    if (dropdownContent.style.display === "block") {
      dropdownContent.style.display = "none";
    } else {
      dropdownContent.style.display = "block";
    }
  });
  