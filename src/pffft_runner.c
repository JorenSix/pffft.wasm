#include <stdlib.h>
#include <assert.h>
#include <stdio.h>

#include "pffft.h"
#include "pffft_window.h"

typedef struct PFFFT_Runner PFFFT_Runner;

struct PFFFT_Runner{
	//The fft struct that is reused
	PFFFT_Setup *fftSetup;

	size_t audioBlockSize;

	//Input fft data
	float *fft_in;
	const float *fft_window;
};

int main(int argc, const char* argv[]){
	//NO OP, disable unused warnings
	((void)argc);
	((void)argv);
}

PFFFT_Runner * pffft_runner_new(size_t audioBlockSize,int bytesPerAudioSample){
	PFFFT_Runner *runner = malloc(sizeof(PFFFT_Runner));

	runner->audioBlockSize = audioBlockSize;

	//The raw format and size of float should be 32 bits
	assert(bytesPerAudioSample == sizeof(float));

	//the samples should be a 32bit float
	int bytesPerAudioBlock = audioBlockSize * bytesPerAudioSample;

	//initialize the pfft object
	// We will use a size of audioblocksize 
	// We are only interested in real part
	runner->fftSetup = pffft_new_setup(audioBlockSize,PFFFT_REAL);
	
	runner->fft_in = pffft_aligned_malloc(bytesPerAudioBlock);//fft input
	runner->fft_window = pffft_window(audioBlockSize);

	return runner;
}

void pffft_runner_transform(PFFFT_Runner * runner,float* audio_data){
	// windowing + copy to fft input
	for(size_t j = 0 ; j <  runner->audioBlockSize ; j++){
		runner->fft_in[j] = audio_data[j] * runner->fft_window[j];
	}
	//do the transform in place
	pffft_transform_ordered(runner->fftSetup, runner->fft_in, audio_data, 0, PFFFT_FORWARD);
}

void pffft_runner_transform_magnitudes(PFFFT_Runner * runner,float* audio_data){
	//transform
	pffft_runner_transform(runner,audio_data);

	//calculate magnitudes in place
	size_t magnitudeIndex = 0;
	for(size_t j = 0 ; j < runner->audioBlockSize ; j+=2){
		audio_data[magnitudeIndex] = audio_data[j] * audio_data[j] + audio_data[j+1] * audio_data[j+1];
		magnitudeIndex++;
	}
}

void pffft_runner_destroy(PFFFT_Runner * runner){
	//cleanup fft structures
	pffft_aligned_free(runner->fft_in);
	
	pffft_destroy_setup(runner->fftSetup);

	free(runner);
}
