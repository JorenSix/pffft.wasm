
const pffft_simd = require('./pffft/pffft.simd.js');
const pffft_no_simd = require('./pffft/pffft.js');

const audio_block_size = 512;
const bytes_per_element = 4;

function tone(audio_block_size){
  		var sampleRate = 48000.0;
		var frequency = 4800.0;
		var amplitude = 0.8;
		var twoPiF = 2 * Math.PI * frequency;
		var buffer = new Float32Array(audio_block_size);
		for (var sample = 0; sample < audio_block_size; sample++) {
			var time = sample / sampleRate;
			buffer[sample] = amplitude * Math.sin(twoPiF * time);
		}
		return buffer;
}


pffft_simd().then(async function(Module) {
    console.log("SIMD PFFFT Module initialized");

    var pffft_runner = Module._pffft_runner_new(audio_block_size,bytes_per_element);
    console.log("New PFFFT runner created: ", pffft_runner);

    // Create example data of a 440Hz tone at 48kHz to test the FFT
    var audio_data = tone(audio_block_size);

    // Get data byte size, allocate memory on Emscripten heap, and get pointer
    var nDataBytes = audio_data.length * audio_data.BYTES_PER_ELEMENT;
    var dataPtr = Module._malloc(nDataBytes);

    // Copy data to Emscripten heap (directly accessed from Module.HEAPU8)
    var dataHeap = new Uint8Array(Module.HEAPU8.buffer, dataPtr, nDataBytes);
    dataHeap.set(new Uint8Array(audio_data.buffer));

    // Call function and get result
    Module._pffft_runner_transform(pffft_runner,dataHeap.byteOffset);

    var fft_result = new Float32Array(dataHeap.buffer, dataHeap.byteOffset, audio_data.length);

    for (var i = 0; i < audio_block_size; i+=2) {
    	var hz = Math.round(48000.0 / 512.0  * i / 2.0);
    	var bin_magnitude = fft_result[i] * fft_result[i] + fft_result[i+1] * fft_result[i+1];
    	if(bin_magnitude > 1 ) console.log("#",i,hz,"Hz",bin_magnitude);
	}

	Module._free(dataPtr);

    Module._pffft_runner_destroy(pffft_runner);
    console.log("PFFFT runner destroyed");
});

pffft_no_simd().then(async function(Module) {
    console.log("PFFFT Module initialized");

    var pffft_runner = Module._pffft_runner_new(audio_block_size,bytes_per_element);
    console.log("New PFFFT runner created: ", pffft_runner);

    // Create example data of a 440Hz tone at 48kHz to test the FFT
    var audio_data = tone(audio_block_size);

    // Get data byte size, allocate memory on Emscripten heap, and get pointer
    var nDataBytes = audio_data.length * audio_data.BYTES_PER_ELEMENT;
    var dataPtr = Module._malloc(nDataBytes);

    // Copy data to Emscripten heap (directly accessed from Module.HEAPU8)
    var dataHeap = new Uint8Array(Module.HEAPU8.buffer, dataPtr, nDataBytes);
    dataHeap.set(new Uint8Array(audio_data.buffer));

    // Call function and get result
    Module._pffft_runner_transform(pffft_runner,dataHeap.byteOffset);

    var fft_result = new Float32Array(dataHeap.buffer, dataHeap.byteOffset, audio_data.length);

    for (var i = 0; i < audio_block_size; i+=2) {
    	var hz = Math.round(48000.0 / 512.0  * i / 2.0);
    	var bin_magnitude = fft_result[i] * fft_result[i] + fft_result[i+1] * fft_result[i+1];
    	if(bin_magnitude > 1 ) console.log("#",i,hz,"Hz",bin_magnitude);
	}

	Module._free(dataPtr);

    Module._pffft_runner_destroy(pffft_runner);
    console.log("PFFFT runner destroyed");
});

