---
slug: container-loading-calculation-for-arcade-machines
section: guide
title: Container Loading Calculation for Arcade Machines That Fit
summary: Container loading calculation for arcade machines using real cabinet dimensions - how many units fit a 20GP, 40GP or 40HQ, and how to plan a mixed load that fills the box.
date: 2026-10-29
image: /images/products/vtsa011-2-player-power-hockey.jpeg
imageAlt: Two-player air hockey table ready for container loading
tag: Planning
related: arcade-video-games, sports-skill-games, kiddie-rides
---

# Container Loading Calculation for Arcade Machines That Fit

Container loading is where a carefully planned purchase order turns into an expensive surprise. A buyer orders twenty machines, pays for a 40HQ, and discovers that fifteen were too tall to stack and the container is 60 percent empty. Or the opposite: the supplier packed to the theoretical maximum, ignored the fact that the machines must be lifted off the truck at the other end, and nailed the crate doors shut.

This guide works through the arithmetic using published cabinet dimensions, so you can estimate a load before you order and hold your supplier to a number.

## Start with the container, not the machine

Every calculation starts with the box.

| Container type | Internal dimensions (L x W x H) | Nominal capacity | Realistic usable volume at 70-85% fill |
|---|---|---|---|
| 20GP | 5.90 x 2.35 x 2.39 m | ~33 CBM | 23 - 28 CBM |
| 40GP | 12.03 x 2.35 x 2.39 m | ~67 CBM | 47 - 57 CBM |
| 40HQ | 12.03 x 2.35 x 2.69 m | ~76 CBM | 53 - 65 CBM |

That third column is the one people forget. The nominal 76 CBM of a 40HQ is a theoretical ceiling calculated with the load perfectly squared to the walls. Real amusement cargo never is, because crates differ, doors have thickness, machinery has irregular shapes, and nobody loads a container by hand with millimetre accuracy.

**Plan on 70 to 85 percent of nominal volume as the working figure.** For regular cabinets in uniform wooden crates, 75 to 85 percent is achievable. For mixed loads with oversized pieces, 65 to 75 percent is more realistic. If a loading plan shows 95 percent, ask how they intend to get the crates back out.

## The calculation method

The loading calculation is a floor-and-height problem, not purely a volume problem. Two constraints must be satisfied at once, and the binding one is whichever is tighter.

**Step 1 - Units per layer.**

```
Units per layer = floor(container length / machine footprint dimension A)
                x floor(container width / machine footprint dimension B)
```

**Step 2 - Number of layers.**

```
Layers = floor(container internal height / machine height)
```

**Step 3 - Volume cross-check.**

```
Total CBM used = units x (W x D x H in metres)
Fill rate = total CBM used / container nominal capacity
```

If the fill rate comes out below 70 percent, the load is height-limited or footprint-limited, not volume-limited, and you have room for more machines. If it comes out above 85 percent, the plan is too tight and will fail in practice.

The important step is using the **crated** dimensions, not bare machine dimensions. A claw crane listed at W78 x D85 x H190 cm sits in a wooden crate adding 5 to 10 cm on every face - a 15 to 25 percent volume penalty, and the difference between 42 machines in a 40HQ and 27.

## Worked examples with real cabinet dimensions

These are the published dimensions for actual models; load figures assume standard export crating.

| Model | Machine size (W x D x H) | CBM per machine | 20GP | 40GP | 40HQ | Binding constraint |
|---|---|---|---|---|---|---|
| VTPG010 mini claw crane | W30 x D45 x H84 cm | 0.11 | 150-180 | 300-380 | 420-520 | Height, then weight |
| VTPG012 mini claw crane | W47 x D55 x H100 cm | 0.26 | 85-95 | 170-190 | 190-210 | Height |
| VTPG022 standard claw crane | W78 x D85 x H190 cm | 1.26 | 14-18 | 32-40 | 34-42 | Footprint, one layer only |
| VTRA018 32-inch arcade cabinet | W82 x D60 x H155 cm | 0.76 | 16-21 | 32-42 | 32-42 | Height, one layer only |
| VTTR065 redemption game | W76 x D98 x H250 cm | 1.86 | 14-16 | 28-32 | 28-34 | Height, one layer only |
| VTSA011 2-player air hockey | W225 x D130 x H98 cm | 2.87 | 7-8 | 16-18 | 16-18 | Footprint width |
| VTKR112 6-player palace carousel | W230 x D230 x H250 cm | 13.23 | Flat rack only | Flat rack only | Flat rack only | Crated width exceeds container |

### The mini claw crane: how a small cabinet fills a big box

VTPG010 at W30 x D45 x H84 cm is the densest machine in the range, and shows how much the container choice matters.

On the 40HQ, the numbers run like this: 12.03 m / 0.30 m gives 40 units along the length, 2.35 m / 0.45 m gives 5 across the width, so 200 units per layer. Height allows 2.69 m / 0.84 m = 3 layers, giving 600 units geometrically. The volume check flags this as wrong: 600 units at 0.11 CBM each is 66 CBM, an 87 percent fill that assumes perfect packing.

Add crate allowance and the realistic figure lands at **420 to 520 units in a 40HQ**, roughly 70 percent fill. Weight becomes the limit here before volume does, so confirm the crated weight per unit against the payload rating, because a 40HQ is typically rated around 26,000 kg. The same machine in a 20GP gives 150 to 180 units at roughly 55 percent fill, a poor choice for mini cranes.

### The standard claw crane: one layer, and that is fine

VTPG022 at W78 x D85 x H190 cm is the volume workhorse of any arcade floor. On a 40HQ the length gives 12.03 / 0.85 = 14 units, the width gives 2.35 / 0.78 = 3 units, so 42 per layer. Height allows only one layer, since 1.90 m doubled is 3.80 m against a 2.69 m ceiling.

**Expect 34 to 42 machines per 40HQ**, with a fill rate of only about 70 percent. That unused 0.79 m of height is not wasted space - it is where the counter-height machines go.

### The 32-inch arcade cabinet: the same answer for every box

VTRA018 at W82 x D60 x H155 cm gives 14 units along the length and 3 across, so 42 per layer, and again only one layer fits. The 40GP and 40HQ give the same answer for the same reason: cabinet height, not container length, is the limit.

This is where mixed loading pays. The leftover height above a row of 32-inch cabinets will take mini claw cranes, prize machines or countertop units almost indefinitely, and a container going out 42 arcade cabinets and 60 mini cranes is worth more than 42 cabinets and nothing else.

### The air hockey table: flat stack, tight footprint

VTSA011 at W225 x D130 x H98 cm is where orientation matters. Turned so the 130 cm dimension runs along the container length and the 225 cm dimension spans the width, the 40HQ takes 9 per layer and two layers, so **16 to 18 tables per 40HQ**. Turned the other way, the 225 cm width leaves 10 cm of slack across a 2.35 m container wall - not enough for anything else, and you pay freight on empty space.

Hockey tables normally ship flat-packed in two crates - playfield and cabinet base separated - rather than assembled. Ask for the crate dimensions and loading plan in that configuration, because an assembled table is a different cargo.

### The palace carousel: when a container is the wrong answer

VTKR112 at W230 x D230 x H250 cm and 225 kg is where the loading calculation stops being arithmetic. Once pallet and crating are added, the crate footprint exceeds the 2.35 m internal width of a standard container.

An assembled unit therefore goes on a **40ft flat rack or open-top platform**, one unit per position with dedicated tie-down. The alternative is shipping the carousel knocked down into panels, which does fit a 40HQ - a decision to make with the supplier before the order is placed. The same applies to any machine over 2.30 m in either horizontal dimension, because one oversized piece changes the freight calculation for everything sharing the box.

## Oversize, weight and stacking rules

**Height and stacking limits.** Most standard cabinets are 190 to 250 cm tall and must be loaded single layer. Only low machines such as the mini cranes and air hockey tables stack, and even then the upper layers need corner posts and edge protection the supplier specifies.

**Weight distribution.** Heavy machines go at the bottom against the container wall, light machines on top. A container with a 225 kg carousel stacked above 35 kg kiddie rides is a load that will not survive the voyage. Ask for the weight per machine and the intended stacking sequence.

**Center of gravity.** A container with 42 tall cabinets and nothing else has a very high center of gravity. It ships, but it will rock in a swell and needs proper dunnage and lashing. Filling the upper third with lighter machines is safer and better value.

**Out of gauge and heavy cargo.** Machines above 2.30 m in any dimension, or above roughly 2,000 kg per crate, need declaring as out of gauge or heavy cargo at the origin terminal, which attracts a surcharge and must be arranged before the container is offered for loading.

## The pre-loading checklist

Get these confirmed in writing before the container is loaded.

1. **Crated dimensions, not bare machine dimensions.** This is the most common discrepancy. Ask for the external dimensions of the shipping crate for every model, and use those in the loading calculation.
2. **A loading plan showing the sequence.** Slot by slot, with model number and quantity in each position, so nothing is decided at the dock.
3. **Confirmation that crates are palletised and labelled with correct slot numbers**, so unloading is not a guessing game.
4. **Lashing specification** - lashing straps, corner boards, and blocking for the heavy pieces.
5. **Moisture protection.** A shrink-wrapped or laminated film outer layer on every crate, silica gel desiccant inside, and a floor lining. Condensation is the most common cause of water damage to electronics and cabinet bases.
6. **Shipping marks and a packing list per crate**, referencing the commercial invoice and your contract number.
7. **Photographs of the loaded container before the door is sealed**, and a loading report from the terminal.

## Using the loading plan to negotiate freight

Freight for a full container is usually charged as a flat rate, so the cost per machine depends entirely on how many machines are in the box.

**A 40HQ holding 42 arcade cabinets costs roughly the same as a 40HQ holding 20.** So a loading plan that fills the box is worth real money, and it is entirely within your control to insist on one.

The way to do it: give the supplier your container target before you order - "I want to fill one 40HQ" - and ask them to propose the model mix that achieves it against your budget and floor plan. A supplier who can solve that arithmetic understands your business. Then check the fill rate against the 70 to 85 percent band, and if it comes in low, ask which models would fill the residual space and at what price.

## Lead time, shipping and arrival

Our standard production lead time is 5-25 days for all models. Add ocean transit and you are looking at the elapsed time from deposit to arrival, which is why lead time and loading plan belong in the same conversation.

Two practical points. First, if your opening date is fixed, work backwards from it and confirm the sailing, not just the production date. Second, space on the trans-Pacific and trans-Atlantic routes is tight in the pre-holiday period, and a container produced on time can still sit at the origin terminal with no vessel available. Book the slot before the container is ready.

## What to ask a supplier

Ask specifically: what are the crated dimensions for each model, what is the loading plan for my container type, what fill rate does it achieve, how many units per model are you loading, what are the weight and stacking arrangements, and what is the total CBM. Then ask whether the plan can be improved with a different mix of your specified models.

Tell us the models, quantity, target container type and destination port, and we will return a loading plan showing how the mix fills the box along with the production schedule. We manufacture the full range - from [arcade video games](/products/arcade-video-games/) through [sports and skill games](/products/sports-skill-games/) to [kiddie rides](/products/kiddie-rides/) - in our own factory, and we plan the load ourselves.

[Send us your requirement](/contact/) or [see the full range](/products/arcade-video-games/).
