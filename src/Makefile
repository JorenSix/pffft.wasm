
pffft_clang:
	clang -o test_pffft -DHAVE_VECLIB -O3 -Wall -W pffft.c pffft_runner.c -framework Accelerate

pffft_wasm_simd:
	mkdir -p ../build/pffft
	emcc -o ../build/pffft/pffft.simd.js pffft.c pffft_runner.c \
		 -O3 \
		 -msimd128 \
		 -Wall \
		 -W \
		 -s INVOKE_RUN=0 \
		 -s MODULARIZE=1 \
		 -s EXPORT_NAME=pffft_simd \
		 -s EXPORTED_FUNCTIONS=_malloc,_free,_pffft_runner_new,_pffft_runner_destroy,_pffft_runner_transform_magnitudes,_pffft_runner_transform \
		 -s EXPORTED_RUNTIME_METHODS="[cwrap]" \


pffft_wasm:
	mkdir -p ../build/pffft
	emcc -o ../build/pffft/pffft.js pffft.c pffft_runner.c \
		 -O3 \
		 -Wall \
		 -W \
		 -DPFFFT_SIMD_DISABLE \
		 -s INVOKE_RUN=0 \
		 -s MODULARIZE=1 \
		 -s EXPORT_NAME=pffft \
		 -s EXPORTED_FUNCTIONS=_malloc,_free,_pffft_runner_new,_pffft_runner_destroy,_pffft_runner_transform_magnitudes,_pffft_runner_transform \
		 -s EXPORTED_RUNTIME_METHODS="[cwrap]" \

