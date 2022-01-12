<script setup lang="ts">
const props = defineProps<{
	heading: string;
	// link: string;
	level: number;
	reveal: boolean;
}>();
</script>

<template>
	<li class="heading-list-item" :data-level="level" :data-reveal="reveal">
		<div v-if="reveal" class="text-wrap">
			<a href="#" class="text">{{ heading }}</a>
		</div>
		<div v-else class="line-wrap" @mouseover="$emit('reveal')">
			<div class="line"></div>
		</div>
	</li>
</template>

<style lang="scss" scoped>
$easeOutBack: cubic-bezier(0.34, 1.56, 0.64, 1);

.heading-list-item {
	z-index: 1;
	font-size: 0.7rem;
	min-height: 1.5rem;
	padding: 0;

	white-space: nowrap;
	position: relative;

	.line-wrap {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 1.5rem;
		z-index: -1;
		animation: lineAppear 250ms $easeOutBack both;

		@keyframes lineAppear {
			0% {
				transform: translateX(1rem);
			}

			100% {
				transform: translateX(0rem);
			}
		}

		.line {
			$height: 2px;
			position: absolute;
			top: 50%;
			margin-top: calc(#{$height} / -2);
			height: $height;
			width: 1.5rem;
			background: var(--text-accent);
		}
	}

	.text-wrap {
		z-index: 9999;
		opacity: 0;
		pointer-events: none;
		height: 100%;
		display: flex;
		align-items: center;
		animation: textAppear 250ms $easeOutBack;
		position: relative;

		@keyframes textAppear {
			0% {
				transform: translateX(-1rem);
			}

			100% {
				transform: translateX(0rem);
			}
		}

		.text {
			background: var(--background-primary);
			padding: 0.25rem;
			border-radius: 0.5rem;

			&::after {
				content: "";
				position: absolute;
				top: 0;
				right: 0;
				bottom: 0;
				left: 0;
			}
		}
	}

	&[data-reveal="true"] {
		.line-wrap {
			.line {
				opacity: 0;
				pointer-events: none;
			}
		}

		.text-wrap {
			opacity: 1;
			pointer-events: all;
		}
	}

	@for $level from 1 through 6 {
		&[data-level="#{$level}"] {
			padding-left: (0.5rem * ($level - 1));
		}
	}
}
</style>
