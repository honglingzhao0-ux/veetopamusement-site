---
slug: arcade-power-and-plug-standards
section: guide
title: Arcade Machine Power Requirements and Plug Standards
summary: What plug do arcade machines use, and what power do they draw? The real power distribution across our catalogue, voltage and frequency by market, plug types, a power budget and site checks.
date: 2026-10-29
image: /banners/hero-1.jpg
imageAlt: Rows of arcade and prize machines on display in the VEETOP showroom
tag: Guide
related: arcade-video-games, redemption-ticket-games, kiddie-rides
---

# Arcade Machine Power Requirements and Plug Standards

The question sounds trivial until it is answered badly. A container of arcade machines arrives in Rotterdam with 220V 50Hz machines and Schuko plugs. The venue in Chicago is on 120V 60Hz with NEMA 5-15 sockets. The machines cannot be plugged in, and the transformer and plug change happens on the loading dock, at the customer's expense.

This is one of the most common and most expensive mistakes in importing amusement equipment, and entirely avoidable: you can specify it in the enquiry, in one line, before anyone builds. This guide covers what our machines draw, the voltage and frequency standards in our main markets, the plug types you will meet, how to size the circuit, and seven site checks.

## What our machines actually draw

We publish a rated power figure for every model where one applies, and 139 of the 210 models carry one. The distribution is not what operators expect: mid-range cabinets dominate, not the motion machines people assume will blow the budget.

| Rated power | Models | Share | Typical category |
|---|---|---|---|
| 350W | 38 | 27.3% | Redemption and ticket games |
| 400W | 18 | 12.9% | Arcade games, moto and racing |
| 200W | 14 | 10.1% | Redemption, hockey, compact units |
| 100-150W | 21 | 15.1% | Basketball, boxing, sports units |
| 500W | 9 | 6.5% | Large motion, gun simulators |
| 300W | 8 | 5.8% | Uprights, dance, road racers |
| 600-800W | 8 | 5.8% | Motion gun sims, dance units |
| 1000W | 2 | 1.4% | Dynamic Moto 3 DX and 5 DX |

21 further models carry single ratings from 40W to 700W. Across all 139 rated models the average is 329W and the median 350W, the most common figure in the catalogue.

Two observations matter for planning. **The heavy machines are a small minority.** Only 12 models exceed 500W and two reach 1000W, so a floor of 30 machines will not be dominated by platforms. **Our published data is not complete.** The 15 [kiddie rides](/products/kiddie-rides/) carry no power rating, and only 1 of the 10 [prize machines and merchandisers](/products/prize-merchandisers/) does. Where a rating is missing, confirm it per model: a rotating ride platform with lighting can pull several hundred watts.

## Voltage and frequency standards by market

Three systems cover almost every destination we ship to.

| Standard | Voltage / frequency | Markets |
|---|---|---|
| Euro / Eurasian | 220-240V, 50Hz | EU, UK, Russia, China, India, Australia, NZ, Gulf states, Israel, Turkey, Africa, SE Asia |
| North American | 110-120V, 60Hz | US, Canada, Mexico, Central America, Taiwan |
| Japanese | 100V, 50Hz east / 60Hz west | Japan and a few neighbours |

The Euro standard is the default for most machines and needs no conversion in the vast majority of destinations. A North American or Japanese destination needs a 110V or 100V configuration, or a conversion on site.

Frequency deserves more attention than it usually gets. A 50Hz fan motor on 60Hz spins roughly 20% faster and runs hotter; a 60Hz motor on 50Hz spins about 17% slower and moves less cooling air, which is how a power supply quietly cooks itself over a summer. On motion platforms, where a motor drives the movement and a fan protects the driver electronics, this is not theoretical.

### Three ways to solve a voltage mismatch

| Solution | How it works | Suitability |
|---|---|---|
| Transformer tap or link change | A primary tap on the internal transformer, moved before shipment | The preferred route, often free if specified at order. Requires the supplier to confirm the model is configurable and set it pre-dispatch |
| Frequency converter | A static unit converting voltage and frequency | Needed when the frequency must change, or a fleet has mixed needs |
| External transformer | A step-down or step-up transformer at the board | Sensible where every machine needs the same conversion, one unit covering the bank |

The first option is only available on some models, and the machine must be opened and reconfigured by a technician. That is why the specification belongs in the purchase order, not an email afterwards. Our [simulator range](/products/arcade-video-games/) and [redemption game range](/products/redemption-ticket-games/) cover the models where this matters most.

## Plug and socket types by market

"Type" refers to the wall socket shape, following the international IEE / IEC system.

| Plug type | Shape | Common in |
|---|---|---|
| Type A | Two flat parallel pins | United States, Mexico, Japan |
| Type B | Two flat pins, round earth | United States, Canada, Taiwan |
| Type C | Two round pins, 4.0mm | Europe, most of Asia, Africa |
| Type D | Three round pins, triangle | India, Sri Lanka, Nepal, Namibia |
| Type E | Two round pins, female earth | France, Belgium, Poland, Czechia |
| Type F | Two round pins, earth clips | Germany, Russia, Netherlands, Nordics |
| Type G | Three rectangular pins | UK, Ireland, Singapore, UAE, Gulf |
| Type I | Two flat angled pins, earth | Australia, NZ, China, Argentina, Chile |
| Type K | Two round pins, half-moon earth | Denmark |

Two notes on supply. The Type C Europlug is ungrounded and rated to 2.5A, so it is unsuitable for a heavy cabinet without a grounded alternative. Type G (BS 1363) is fused at 13A and standard across the Middle East and SE Asia.

For a permanent installation, ask whether the machine can be supplied with an IEC 60320 inlet (C13/C14 for detachable leads, C19/C20 for higher current) and hard-wired, or with an IEC 60309 industrial connector, clock-position coded by voltage (6h for 200-250V, 4h for 100-130V). Either removes the trailing-cable trip hazard.

## Sizing the circuit for a floor of machines

Here is a worked example for a typical 30-machine venue, built from the ratings above. The mix is illustrative but drawn from real catalogue ratings: 12 redemption games at 350W, 6 arcade games at 400W, 4 arcade games at 500W, 4 sports games at 150W, 2 motion platforms at 1000W, 2 claw cranes at 450W.

**Total connected load: 12,100W, or 12.1kW. Average per machine: 403W.**

On a three-phase supply, current is total watts divided by 1.732 times voltage times power factor. The figures below assume a power factor of 0.9 and the standard 125% continuous-load margin.

| Supply | Current at 12.1kW | At 9.68kW (0.8 diversity) | Main breaker |
|---|---|---|---|
| 220V, three-phase | 35.3A | 28.2A | 50A three-phase |
| 230V, single-phase | 58.5A | 46.8A | 80A single-phase, or split over 2 circuits |
| 120V, single-phase | 112.0A | 89.6A | 150A single-phase, or split over 3 circuits |
| 110V, single-phase | 122.2A | 97.8A | 160A single-phase, or split over 3 circuits |

The 0.8 diversity factor assumes not every machine draws full rated power at the same instant. If unsure, plan on the full connected load. Branch-circuit guidance for a 220V 230V single-phase site:

| Branch circuit | Usable capacity | 350W cabinets | 1000W platforms |
|---|---|---|---|
| 13A | 2.69kW | 7 | 2 |
| 16A | 3.31kW | 9 | 3 |
| 20A | 4.14kW | 11 | 3 |

**Never put a 1000W motion platform on the same circuit as a row of redemption cabinets.** The platform motor draws a startup inrush several times its running current, which on a shared circuit pulls the voltage down far enough to reset the redemption machines alongside it. The operator then wonders why the games reboot.

## Surge, lightning and the machines that must not go down

**Surge protection at the distribution board.** A single Type 2 surge protective device on the main panel protects the whole floor for a fraction of the cost of per-machine protection, the highest-return electrical item in a venue.

**Isolation transformers for the sensitive machines.** The power supplies in redemption and ticket games, and the control boards in motion cabinets, are your most sensitive electronics. An isolation transformer on the critical circuits protects against brownouts and spikes from other tenants.

**A UPS for the systems that must stay up.** Not for the whole floor, but for the coin counter, the network cabinet running the prize counter system, and the cash register. A prize counter that cannot print a ticket is a revenue stop.

Lightning protection belongs with your electrician and building insurer. What matters for the purchase is that the machines are properly earthed and earth continuity tested.

### What it costs to run

The method: multiply the connected load in kW by your average load factor, then by operating hours per day and days per month. For the 12.1kW example above, at a 30% load factor, 12 hours a day and 30 days a month, the average draw is 3.63kW, daily consumption 44kWh, annual consumption 15,682kWh.

At commercial electricity prices of 0.12-0.30 USD per kWh, which is a **typical industry range and an estimate, not a quoted tariff**, that is roughly 157-392 USD per month, or 1,882-4,704 USD per year for the floor. The load factor is what most people get wrong: a machine powered all day but played 90 minutes an hour draws well under its rated power. Use 25-35% for a mixed floor, 15-20% for mall units.

## Seven things to confirm on site before the container is opened

1. **Voltage.** The actual supply voltage at the machine position, measured with a multimeter, not read off the drawings.
2. **Frequency.** 50Hz or 60Hz, confirmed on the same meter. Check this in Japan, where one country uses both.
3. **Socket shape and rating.** Photograph the socket. Confirm whether it is grounded and fused.
4. **Earthing and continuity.** Proper earth continuity to each machine position. A safety requirement and an insurance condition.
5. **Circuit capacity and breaker rating.** Confirm the main breaker and branch circuits, and what else shares them.
6. **Floor loading.** Especially for motion platforms, [kiddie rides](/products/kiddie-rides/) and heavier cabinets, confirm the floor carries the concentrated load and platform vibration.
7. **Aisle width and cable routing.** Clearances for the machine, technician and player, and a cable route that does not cross a walkway. A machine re-sited for cable routing is de-prioritised for life.

## Put the voltage and plug in the enquiry

The conclusion is worth stating plainly. **Write the target market's voltage, frequency and plug type into your enquiry, and get the answer confirmed in the quotation.** One line, in the first message:

> Destination: Chicago, USA. Supply: 120V, 60Hz, NEMA 5-15. Please confirm whether machines ship with 120V configuration, and if not, quote the transformer and plug change options and who arranges them.

Without that line, the default assumption in the quotation will be 220V 50Hz, because that is what most of the world runs and what our machines are built around. With it, this becomes a priced line item decided before production, not a problem found on the dock.

## What to ask your supplier

Ask specifically:

- What is the rated power for each model, and the rated voltage and frequency range it supports?
- Can the machine be configured for 120V 60Hz or 100V, and if so is that done before shipment at no cost?
- What plug or IEC connector is fitted as standard, and can it be changed for the destination market?
- What is the startup inrush current for the motion platforms, and can they sit on a dedicated circuit?
- What spare parts are stocked for export, particularly power supplies, and the replacement lead time?

We manufacture arcade and amusement equipment directly and have done for over 21 years, exporting to more than 150 countries, with all machines CE certified for the European market. Tell us the destination country, port and site supply details, and we will confirm the electrical configuration of each model alongside pricing, MOQ and delivery. Standard production lead time is 5-25 days.

[Send us your requirement](/contact/) or [see the full arcade range](/products/arcade-video-games/).
