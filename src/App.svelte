
<script>

	import TabList from "./components/TabList.svelte";
	import FilledButton from "./components/FilledButton.svelte";
	import ProgressCircleList from "./components/ProgressCircleList.svelte";

	let groups = [
		{id: 0, title: "General", tasks: 16, done: 3, color: "#3069DF"},
		{id: 1, title: "Meetings", tasks: 8, done: 7, color: "#FC7449"},
		{id: 2, title: "Trip", tasks: 8, done: 3, color: "#63F4F7"}
	];

	function changeGroupName(event) {
		let id = event.detail.id;
		let newName = event.detail.newName;

		for(let i = 0; i < groups.length; i++)
		{
			if(groups[i].id == id) {
				groups[i].title = newName;
				break;
			}
		}
	}

</script>


<div class="container">
	<div class="top">
		<div class="left">
			<TabList on:nameChanged={changeGroupName} {groups}/>
			<FilledButton value={"+ CREATE NEW GROUP"} on:clicked={() => { console.log("clicked"); }}/>
		</div>
		<div class="right">
			<ProgressCircleList {groups}/>
		</div>
	</div>
	<div class="bottom">
	</div>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		justify-content: space-evenly;
		align-items: center;
		margin-top: 70px;
	}

	.top {
		display: flex;
		flex-direction: row;
	}
</style>