'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

//////// DATA ARCH ////////////
class Workout {
    id = (Date.now() + '').slice(-10);
    date = new Date();
    constructor(coords, distanceKM, durationMIN) {
        this.coords = coords;
        this.distanceKM = distanceKM;
        this.durationMIN = durationMIN;
    }

    _setDescription() {
        // prettier-ignore
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        this.description = `${this.typeOfWorkout[0].toUpperCase()}${this.typeOfWorkout.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
    }
}

class Running extends Workout {
    typeOfWorkout = 'running';

    constructor(coords, distanceKM, durationMIN, cadanceStepsMin) {
        super(coords, distanceKM, durationMIN);
        this.cadanceStepsMin = cadanceStepsMin;
        this._calcPace();
        this._setDescription();
    }

    _calcPace() {
        this.pace = this.durationMIN / this.distanceKM
        return this.pace
    }
}


class Cycling extends Workout {
    typeOfWorkout = 'cycling';

    constructor(coords, distanceKM, durationMIN, elevationGainMeter) {
        super(coords, distanceKM, durationMIN);
        this.elevationGainMeter = elevationGainMeter;
        this._calcSpeed();
        this._setDescription();
    }

    _calcSpeed() {
        this.speed = this.distanceKM / (this.durationMIN / 60);
        return this.speed;
    }
}
///////////////////////////////

//////// APP ARCH ////////////
class App {
    #map;
    #mapEvent;
    #workouts = [];

    constructor() {
        // get informaiton for rendering
        this._getPosition();
        this._getLocalStorage();

        // Attach event handlers
        form.addEventListener('submit', this._newWorkout.bind(this));
        inputType.addEventListener('change', this._toggleElevationField);
        containerWorkouts.addEventListener('click', this._moveToPopUp.bind(this));
    }

    _getPosition() {
        if (navigator.geolocation)
            navigator.geolocation.getCurrentPosition(
                this._loadMap.bind(this),
                function () {
                    alert('Could not get your position')
                });
    }

    _loadMap(position) {
        const { latitude } = position.coords;
        const { longitude } = position.coords;
        // console.log(latitude, longitude);
        // console.log('https://www.google.com/maps/@52.5364468,13.3679877,14');

        const coords = [latitude, longitude];

        this.#map = L.map('map').setView(coords, 13);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);


        // handling clicks on map
        this.#map.on('click', this._showForm.bind(this));

        // render all markers 
        this.#workouts.forEach(workout => {
            this._renderWorkoutMarker(workout);
        });
    }

    _showForm(mapE) {
        this.#mapEvent = mapE;
        form.classList.remove('hidden');
        inputDistance.focus();
    }

    _hideForm() {
        inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value = '';

        form.style.display = 'none';
        form.classList.add('hidden');
        setTimeout(() => (form.style.display = 'grid'), 1000)
    }


    _toggleElevationField() {
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }

    _newWorkout(event) {
        event.preventDefault();

        const areNumbers = (...inputs) => inputs.every(input => Number.isFinite(input));

        const arePositiveNumbers = (...inputs) => inputs.every(input => input > 0);

        // get data from the form
        const typeOfWorkout = inputType.value;
        const distanceKM = +inputDistance.value;
        const durationMIN = +inputDuration.value;
        const { lat, lng } = this.#mapEvent.latlng;
        let workout;

        // based on workout type, create relevant object & push it to workouts array
        if (typeOfWorkout === 'running') {

            const cadanceStepsMin = +inputCadence.value;

            if (
                !areNumbers(distanceKM, durationMIN, cadanceStepsMin) || !arePositiveNumbers(distanceKM, durationMIN, cadanceStepsMin)
            )
                return alert('Input should be a valid number')
            // create object

            workout = new Running([lat, lng], distanceKM, durationMIN, cadanceStepsMin);

        };

        if (typeOfWorkout === 'cycling') {
            const elevationGainMeter = +inputElevation.value;

            if (
                !areNumbers(distanceKM, durationMIN, elevationGainMeter) || !arePositiveNumbers(distanceKM, durationMIN)
            )
                return alert('Input should be a valid number')


            workout = new Cycling([lat, lng], distanceKM, durationMIN, elevationGainMeter);
        };

        this.#workouts.push(workout);

        // render workout on map
        this._renderWorkoutMarker(workout);

        // render workout on the list
        this._renderWorkout(workout);

        // hide form & clear input fields
        this._hideForm();

        // store data in browser
        this._setLocalStorage();

    }

    _renderWorkout(workout) {
        let html = `
            <li class="workout workout--${workout.typeOfWorkout}" data-id="${workout.id}">
                <h2 class="workout__title">${workout.description}</h2>
                <div class="workout__details">
                    <span class="workout__icon">${workout.typeOfWorkout === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
                    <span class="workout__value">${workout.distanceKM}</span>
                    <span class="workout__unit">km</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">⏱</span>
                    <span class="workout__value">${workout.durationMIN}</span>
                    <span class="workout__unit">min</span>
                </div>
        `;

        if (workout.typeOfWorkout === 'running')
            html += `
                    <div class="workout__details">
                        <span class="workout__icon">⚡️</span>
                        <span class="workout__value">${workout.pace.toFixed(1)}</span>
                        <span class="workout__unit">min/km</span>
                    </div>
                    <div class="workout__details">
                        <span class="workout__icon">🦶🏼</span>
                        <span class="workout__value">${workout.cadanceStepsMin}</span>
                        <span class="workout__unit">spm</span>
                    </div>
                </li>
            `;

        if (workout.typeOfWorkout === 'cycling')
            html += `
                    <div class="workout__details">
                        <span class="workout__icon">⚡️</span>
                        <span class="workout__value">${workout.speed.toFixed(1)}</span>
                        <span class="workout__unit">km/h</span>
                    </div>
                    <div class="workout__details">
                        <span class="workout__icon">⛰</span>
                        <span class="workout__value">${workout.elevationGainMeter}</span>
                        <span class="workout__unit">m</span>
                    </div>
                </li>
            `;

        // form.insertAdjacentElement('afterend', html);
        // Create a container element
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = html.trim();

        // Get the actual list item (li) element
        const workoutElement = tempContainer.firstChild;

        // Insert the element into the DOM
        form.insertAdjacentElement('afterend', workoutElement);
    }

    _renderWorkoutMarker(workout) {
        L.marker(workout.coords)
            .addTo(this.#map)
            .bindPopup(
                L.popup({
                    maxWidth: 250,
                    minWidth: 100,
                    autoClose: false,
                    closeOnClick: false,
                    className: `${workout.typeOfWorkout}-popup`
                })
            )
            .setPopupContent(`${workout.typeOfWorkout === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`)
            .openPopup();
    }

    _moveToPopUp(event) {
        const workoutEl = event.target.closest('.workout');

        if (!workoutEl) return;

        const workout = this.#workouts.find(workout => workout.id === workoutEl.dataset.id);

        this.#map.setView(workout.coords, 13, {
            animate: true,
            pan: {
                duration: 1,
            },
        })
    }

    _setLocalStorage() {
        localStorage.setItem('workouts', JSON.stringify(this.#workouts));
    }

    _getLocalStorage() {
        const data = JSON.parse(localStorage.getItem('workouts'));

        if (!data) return;
        this.#workouts = data;
        this.#workouts.forEach(workout => {
            this._renderWorkout(workout);
        });
    }

    reset() {
        localStorage.removeItem('workouts');
        location.reload();
    }

}

const app = new App();
///////////////////////////////


// const run1 = new Running([39, -12], 5.2, 24, 178);
// const cycling1 = new Cycling([39, -12], 27, 95, 523);
// console.log(run1, cycling1);

