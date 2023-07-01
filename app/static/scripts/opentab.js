function openTab(sectionType, memberId) {
    // Hide all tab content
    var tabContents = document.getElementsByClassName(sectionType + '-tab');
    
    for (var i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('active');
    }
  
    // Show the selected tab content
    var selectedTabContent = document.getElementById('content-' + sectionType + '-' + memberId);
    selectedTabContent.classList.add('active');

    // Sets the active tab button
    var tabButtons = document.querySelectorAll('.tab-button[data-section="' + sectionType + '"]');
    for (var i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove('active');
    }
    
    var selectedTabButton = document.getElementById('tab-' + sectionType + '-' + memberId);
    selectedTabButton.classList.add('active');
}