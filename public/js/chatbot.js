document.addEventListener('DOMContentLoaded', function() {
    var dialog = document.getElementById('chatbotDialog');
    dialog.style.display = 'none'; // Ensure dialog is hidden on page load

    document.getElementById('chatbotButton').addEventListener('click', function() {
        if (dialog.style.display === 'none' || dialog.style.display === '') {
            dialog.style.display = 'block';
            dialog.style.position = 'fixed';
            dialog.style.bottom = '80px';
            dialog.style.right = '20px';
            dialog.style.backgroundColor = 'white';
            dialog.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
            dialog.style.zIndex = '1000';
            dialog.style.borderRadius = '10px';
            dialog.style.overflow = 'hidden';
        } else {
            dialog.style.display = 'none';
        }
    });
});