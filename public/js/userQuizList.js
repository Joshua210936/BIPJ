document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('.search-input');
    const moduleFilter = document.getElementById('moduleFilter');
    const testsTable = document.getElementById('testsTable');
    let allTests = [];

    function renderTests(tests) {
        testsTable.innerHTML = '';
        tests.forEach(test => {
            const tr = document.createElement('tr');
            tr.classList.add('test-item');
            tr.dataset.testName = test.testName.toLowerCase();
            tr.dataset.module = test.module.toString();
            tr.innerHTML = `
                <td>${test.testName}</td>
                <td>${test.module}</td>
                <td>${test.numberOfQuestions}</td>
                <td>${test.totalPoints}</td>
                <td>
                    <button onclick="takeQuiz('${test.testID}')" class="btn-take-quiz">Take Quiz</button>
                </td>
            `;
            testsTable.appendChild(tr);
        });
    }

    function filterTests() {
        const query = searchInput.value.toLowerCase();
        const moduleQuery = moduleFilter.value.trim();

        const filteredTests = allTests.filter(test => {
            const matchesName = test.testName.toLowerCase().includes(query);
            const matchesModule = moduleQuery === '' || test.module.toString() === moduleQuery;
            return matchesName && matchesModule;
        });

        renderTests(filteredTests);
    }

    searchInput.addEventListener('input', filterTests);
    moduleFilter.addEventListener('change', filterTests);

    // Initialize allTests with data from the server or from the DOM
    allTests = Array.from(document.querySelectorAll('.test-item')).map(row => ({
        testName: row.querySelector('td:nth-child(1)').textContent.trim(),
        module: row.querySelector('td:nth-child(2)').textContent.trim(),
        numberOfQuestions: row.querySelector('td:nth-child(3)').textContent.trim(),
        totalPoints: row.querySelector('td:nth-child(4)').textContent.trim(),
        testID: row.querySelector('button').getAttribute('onclick').match(/'(\d+)'/)[1],
    }));
});
